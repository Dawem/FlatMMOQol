const isNotificationsEnabled = true;

const notificationLoop = () => {
  if (!isNotificationsEnabled) {
    return;
  }
  if (sleepValue === "0") {
    play_sound("sounds/menu1.wav");
  }
};
