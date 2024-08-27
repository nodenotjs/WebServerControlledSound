exports.timestampToHourFormat = function (time) {
   let totalSeconds = Math.floor(time / 1000);
   let totalMinutes = Math.floor(totalSeconds / 60);
   let totalHours = Math.floor(totalMinutes / 60);

   let seconds = totalSeconds % 60;
   let minutes = totalMinutes % 60;
   let hours = totalHours;

   return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

}