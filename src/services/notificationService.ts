import { FieldSubmission } from '../types';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Checks if Notification and Service Worker APIs are supported
 */
export function isNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
}

/**
 * Gets the current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermissionStatus {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
}

/**
 * Requests notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermissionStatus;
  } catch (error) {
    console.warn('[Notification] Error requesting permission:', error);
    return Notification.permission as NotificationPermissionStatus;
  }
}

/**
 * Sends a rich notification to the Field Agent via Service Worker
 * Triggered when an Admin approves, rejects, or flags a price submission
 */
export async function notifyFieldAgentSubmissionStatus(
  submission: FieldSubmission,
  status: 'approved' | 'rejected' | 'recheck',
  reason?: string
): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  const permission = Notification.permission;
  if (permission !== 'granted') {
    console.log('[Notification] Notification skipped: Permission is', permission);
    return false;
  }

  // Compose notification content based on status
  let title = '';
  let body = '';
  let icon = '/favicon.ico';
  let tag = `submission-${submission.id}-${status}`;

  if (status === 'approved') {
    title = `✅ Submission Approved • ${submission.submissionNumber}`;
    body = `Great job! Your price report for ${submission.productName} at ${submission.marketName} (₦${submission.price.toLocaleString()}) has been verified. ₦650 bounty credited!`;
  } else if (status === 'rejected') {
    title = `❌ Submission Rejected • ${submission.submissionNumber}`;
    body = `Your price report for ${submission.productName} at ${submission.marketName} was rejected. ${
      reason ? `Reason: ${reason}` : 'Discrepancy detected with benchmark prices.'
    }`;
  } else if (status === 'recheck') {
    title = `⚠️ Re-Verification Requested • ${submission.submissionNumber}`;
    body = `An admin requested a photo/price re-check for ${submission.productName} in ${submission.marketName}.`;
  }

  const notificationPayload = {
    title,
    options: {
      body,
      icon,
      badge: icon,
      tag,
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: '/',
        submissionId: submission.id,
        submissionNumber: submission.submissionNumber,
        productName: submission.productName,
        marketName: submission.marketName,
        price: submission.price,
        status,
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'view_details',
          title: 'View Report',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
    },
  };

  try {
    // Primary delivery: Via active Service Worker Registration
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(
          notificationPayload.title,
          notificationPayload.options
        );
        console.log('[Notification] Displayed via ServiceWorker registration:', tag);
        return true;
      }

      // Fallback via postMessage to controller
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          ...notificationPayload,
        });
        console.log('[Notification] Dispatched via ServiceWorker controller message:', tag);
        return true;
      }
    }

    // Direct Notification constructor fallback
    new Notification(notificationPayload.title, notificationPayload.options);
    return true;
  } catch (err) {
    console.warn('[Notification] Failed to show service worker notification:', err);
    return false;
  }
}

/**
 * Triggers a simulated test notification for field agents to verify their device alerts
 */
export async function sendTestFieldAgentNotification(): Promise<boolean> {
  const dummySubmission: FieldSubmission = {
    id: `test-${Date.now()}`,
    submissionNumber: 'MP-PH-7499',
    productId: 'mama-gold-rice-50kg',
    productName: 'Mama Gold Rice (50kg)',
    marketId: 'mile-3-market',
    marketName: 'Mile 3 Market',
    city: 'Port Harcourt',
    price: 78200,
    quantity: 1,
    unit: '50kg Bag',
    sellerStall: 'Stall 42 (Mama Joy)',
    agentId: 'FA-PH-084',
    agentName: 'David Peters',
    agentInitials: 'DP',
    agentLevel: 'Senior Verifier',
    agentReputation: 98.4,
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkZdGqfLDyWMwVkHWY9jVke68rbpKstU6_ExyLHjNJHUwRatSlfaDoBG7GQUumsVcM6g39B1hTthgSsUqtcQVASYFM42zQA2xbyPvPrG5Pl7fsONd199psmdp0FWcCw2COY3OoeYVbYWCqYoMJ1VIA78IJNYDrPXxVecBRm8ERaFiP63b5xoioUj1ngqgj0Ry6v72pN37Kdam85ST0D9q5IY6O7xFRgLOeptfZFlAbyaDvVc_WHie-Q',
    exifMatched: true,
    gpsLocation: { lat: 4.8156, lng: 7.0094, address: 'Mile 3 Market, Port Harcourt' },
    submittedAt: 'Just now',
    timestamp: new Date().toISOString(),
    status: 'verified',
    systemConfidence: 96,
    systemRecommendation: 'AUTO_VERIFY',
    nearbyMarketComparisons: [],
  };

  return notifyFieldAgentSubmissionStatus(dummySubmission, 'approved');
}

/**
 * Listens for Service Worker notification clicks (deep link to submission)
 */
export function listenToNotificationClicks(
  onNotificationClick: (data: { submissionId: string; status: string; action?: string }) => void
): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'NOTIFICATION_ACTION_CLICKED') {
      console.log('[Notification] Click event received from SW:', event.data);
      onNotificationClick(event.data.data);
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);

  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}
