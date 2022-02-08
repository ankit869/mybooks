
self.addEventListener("push", e => {
  console.log("Push Recieved...");
  const title=e.data.json().title;
  const body=e.data.json().body;
  const icon="/images/icon.ico"
  e.waitUntil(
    self.registration.showNotification(title,{
        body:body,
        icon:icon,
    })
  );
 
});
