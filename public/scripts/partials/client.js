window.addEventListener('load', () => {
  $.ajax({
    url:'/private/user_detail',
    method: 'GET',
    async:true,
        success: function(response) {
        if(response!="unauthorized"){
          const publicVapidKey =
            "BBy7N9L2ORQ4lPl5IJsB8lQA8s-U2M3nyRnx-KtsHV3fvID9amn3Z9NBda8wx-ZKkKweSG6tUBO2dqnZ722oUhY";

          // Check for service worker
          if ("serviceWorker" in navigator) {
            send().catch(err => console.error(err));
          }

          // Register SW, Register Push, Send Push
          async function send() {
            // Register Service Worker
            const register = await navigator.serviceWorker.register("/scripts/partials/worker.js", {
              scope: "/scripts/partials/"
            });

            // Register Push
            const subscription = await register.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Send Push Notification
            await fetch("/subscribe?subscription="+JSON.stringify(subscription), {
              method: "GET"
            });
          }

          function urlBase64ToUint8Array(base64String) {
            const padding = "=".repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
              .replace(/\-/g, "+")
              .replace(/_/g, "/");

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
          }
        }
    }
  })
})
    
  
