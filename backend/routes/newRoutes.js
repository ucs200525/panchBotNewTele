// const express = require('express');
// const app = express();
// const port = 4000;

// // Function to convert time to seconds (assuming you have timeToSeconds and secondsToTime functions defined)
// const timeToSeconds = (time) => {
//   const [hrs, mins, secs] = time.split(':').map(Number);
//   return hrs * 3600 + mins * 60 + (secs || 0);
// };

// const secondsToTime = (seconds) => {
//   const baseDate = new Date(currentDate); // Ensure currentDate is a valid Date object

//   // If seconds exceed a day, calculate the date and time
//   const daysPassed = Math.floor(seconds / 86400); // Calculate how many full days have passed
//   seconds = seconds % 86400; // Ensure seconds are within a day
//   seconds = Math.round(seconds * 100) / 100; // Round seconds to 2 decimal places

//   let hrs = Math.floor(seconds / 3600); // Get hours
//   const mins = Math.floor((seconds % 3600) / 60); // Get minutes
//   const secs = Math.round(seconds % 60); // Get seconds, rounded to the nearest second

//   let timeString;

//   // Convert to 12-hour format if needed
//   if (is12HourFormat) {
//     const period = hrs >= 12 ? 'PM' : 'AM'; // Determine AM/PM
//     hrs = hrs % 12 || 12; // Convert to 12-hour format, 0 becomes 12
//     timeString = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
//   } else {
//     timeString = `${String(hrs).padStart(2, '00')}:${String(mins).padStart(2, '00')}:${String(secs).padStart(2, '00')}`; // 24-hour format
//   }

//   // If more than 1 day has passed, append the date, else just return the time
//   if (daysPassed > 0) {
//     baseDate.setDate(baseDate.getDate() + 1); // Add 1 day to currentDate
//     const formattedDate = baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Format the date like "Nov 29"
//     timeString = ` ${formattedDate} , ${timeString}`; // Append the formatted date to the time string
//   }

//   return timeString;
// };


// // // Helper function to find the closest day (you need to define your logic here)
// // const findClosestDay = (weekday) => {
// //   // Assuming weekday is passed as a string like 'Monday', 'Tuesday', etc.
// //   return weekday; // Modify this based on your logic for finding the closest day
// // };

// app.use(express.json()); // To handle JSON requests

// app.post('/update-table', (req, res) => {
//   // Assuming `sunriseToday`, `sunsetToday`, and `sunriseTmrw` are sent in the request body
//   const { sunriseToday, sunsetToday, sunriseTmrw, weekday } = req.body;

//   const totalSec = timeToSeconds('24:00:00');
//   const sunriseTodaySec = timeToSeconds(sunriseToday);
//   const sunsetTodaySec = timeToSeconds(sunsetToday);
//   const sunriseTmrwSec = timeToSeconds(sunriseTmrw);

//   const interval1 = (sunsetTodaySec - sunriseTodaySec) / 30;
//   const interval2 = ((totalSec + sunriseTmrwSec) - sunsetTodaySec) / 30;
//   const newTableData = [];
//   let sunrise = sunriseTodaySec;
//   let sunset = sunsetTodaySec;

//   const weekdayRows = {
//     "Monday": [0, 5, 12, 13, 21, 26, 29],
//     "Tuesday": [2, 3, 7, 8, 9, 11, 12, 13, 14, 15, 18, 20, 21, 22,24],
//     "Wednesday": [0, 1, 4, 5, 6, 7, 9, 19, 27, 29],
//     "Thursday": [2, 5, 8, 11,13, 14, 15, 16, 18, 19, 20, 23, 24, 27, 28],
//     "Friday": [1, 4, 6, 8, 14, 16, 18, 19, 22, 23, 24, 25, 26, 28],
//     "Saturday": [0, 8, 9, 11, 12, 17, 22, 23, 25],
//     "Sunday": [2, 3, 4, 5, 10, 14, 16, 19, 21, 23,24,25, 28]
//   };

//   const closestDay =weekday;

//   const weekdayValues = {
//     "Sunday": [
//         "ప్రయాణకార్యసిద్ధి", "విద్యాజయం", "ఉద్యోగ కష్టం", "శత్రువృద్ధి", "చోరభయం", "దుఃఖము", "అభీష్టసిద్ధి", "సౌఖ్యం-లాభం", 
//         "వివాహాదిశుభాని", "మిత్రవృద్ధి", "మృత్యుభయం", "ఆరోగ్యం", "శుభకార్యజయం", "ప్రయత్నఫలం", "విషభయం", "ఉద్యోగం", 
//         "జ్వరప్రాప్తి", "రాజసన్మానం", "ప్రయాణలాభము", "వివాదము", "మిత్రత్వము", "జ్వరభయము", "ధనలాభము", "బంధనం", 
//         "స్థానభ్రంశము", "విద్యాభంగము", "స్త్రీ భోగం", "ప్రయాణ జయం", "ప్రయాణ నాశము", "భూలాభము"
//     ],
//     "Monday": [
//         "కార్యహాని", "రాజపూజ్యత", "వాహన ప్రాప్తి", "స్త్రీ సౌఖ్యము", "భూలాభము", "స్థానభ్రంశము", "గుప్తధనలాభము", "వ్యవహారజయం", 
//         "ఉద్యోగము", "ప్రియభోజనం", "స్త్రీ లాభము", "రాజదర్శనం", "కార్యభంగం", "రోగపీడ", "కార్యసిద్ధి", "శత్రునాశము", 
//         "గో లాభము", "కార్యజయము", "ఆరోగ్యం", "మిత్రత్వము", "సౌఖ్యము", "కార్యభంగము", "వివాహజయం", "కార్యప్రాప్తి", 
//         "ధనలాభము", "విద్యాలాభము", "స్థిరకార్యనాశము", "ఉద్యోగజయం", "యాత్రా ప్రాప్తి", "రాజభయం"
//     ],
//     "Tuesday": [
//         "ధనలాభం", "ప్రయాణజయం", "దుఃఖము", "భూతభయము", "వాహనప్రాప్తి", "పరోపకారము", "వస్త్ర ప్రాప్తి", "ప్రయాణ నష్టం", 
//         "వివాదహాని", "శత్రుబాధ", "స్త్రీ లాభము", "కార్యనాశనము", "కష్టం", "జంతు భయం", "అగ్నిబాధ", "రోగపీడ", 
//         "పుత్రలాభము", "కార్యజయము", "చిక్కులు", "రాజ సన్మానం", "నమ్ము అగుట", "కార్యనష్టము", "అపజయం", "శత్రుజయం", 
//         "ఉద్యోగహాని", "జయప్రదము", "కార్యసిద్ధి", "కార్యలాభం", "సుఖసౌఖ్యం", "మిత్రత్వము"
//     ],
//     "Wednesday": [
//         "దుర్వార్తలు", "మనఃక్షోభం", "ధనలాభం", "యత్నకార్యసిద్ధి", "కార్యభంగము", "మహాభయము", "మనశ్చాంచల్యం", "ఉపద్రవములు", 
//         "జయప్రదము", "ప్రయాణభయము", "రాజసన్మానము", "ధనధాన్యవృద్ధి", "ఉద్యోగజయం", "లాభము", "ప్రయత్నజయం", "వస్త్ర లాభం", 
//         "సంతోషం", "క్షేమం", "స్వల్పలాభం", "కలహము", "ఇష్టసిద్ధి", "పుత్రలాభము", "ఉద్యోగజయం", "ప్రయాణజయం", 
//         "వ్యవహారజయం", "వివాహశుభం", "కార్యజయం", "మనఃక్లేశము", "బంధుసమాగము", "వాహనప్రమాదం"
//     ],
//     "Thursday": [
//         "ధనలాభం", "మనోభీష్టసిద్ధి", "అనారోగ్యం", "వాహన ప్రాప్తి", "వివాహశుభం", "సుఖనాశనం", "ఉద్యోగజయం", "స్వామిదర్శనం", 
//         "ప్రయాణభంగం", "కార్యసిద్ధి", "వ్యాపారజయం", "శత్రునాశం", "వివాహజయం", "రోగనాశం", "కలహప్రదం", "ఉద్యోగ నష్టం", "కోపతీవ్రత",
//         "కార్యజయం", "స్థాననాశం", "చోరభయం", "వివాహకలహం", "వివాదజయం", "యాత్రాశుభం", "ధైర్యహాని", "కార్యభంగం", 
//         "ప్రయాణక్షేమం", "వివాహ శుభం", "కలహప్రదం", "జ్వరశస్త్రబాధ", "విద్యాభివృద్ధి"
//     ],
//     "Friday": [
//         "కార్యసిద్ధి", "కార్యనాశము", "ధనలాభము", "రాజానుగ్రహం", "అపజయం", "కార్యజయం", "దుఃఖం-భయం","ధైర్యం", "కష్టం-నష్టం", 
//         "సౌఖ్యము", "అనుకూలము", "వస్తువాహనప్రాప్తి", "క్షేమం-లాభం", "కార్యవిజయం", "శస్త్ర భయం", "శత్రునాశం", "అతిభయము", 
//         "విద్యాసిద్ధి","రోగ బాధలు", "దుఃఖము", "వాహనప్రాప్తి", "స్త్రీ లాభము", "స్పోటకపీడ", "విషజంతుభయం", "ప్రయాణకష్టం", "శత్రుభయం", 
//         "కార్యనష్టం", "ప్రయాణసౌఖ్యం", "దుఃఖము", "రాజసన్మానం"  ],
//     "Saturday": [
//         "కార్యహాని", "సౌఖ్యము", "వివాహసిద్ధి", "మిత్రత్వం", "ప్రయాణజయం", "వాహనలాభం", "కార్యజయం", "రాజసన్మానం", 
//         "కార్యనష్టం", "ప్రయాణహాని", "వస్త్ర-స్త్రీలాభాలు", "మనశ్చాంచల్యం", "మిత్రనష్టం", "మిత్రప్రాప్తి", "స్త్రీ లాభం", 
//         "ధనలాభము", "ప్రయాణజయం", "ప్రయాణ నష్టం", "క్షేమం", "వాహనయోగం", "జ్ఞానవృద్ధి", "వినోదము", "కలహము", 
//         "ఉద్యోగనష్టం", "ప్రయత్నజయం", "మనస్తాపం", "శత్రునాశం", "విరోధనాశనం", "ప్రయాణ లాభం","ప్రియవార్తలు"
//     ]
// };

//   for (let i = 0; i < 30; i++) {
//     const start1 = secondsToTime(sunrise);
//     sunrise += interval1;
//     const end1 = secondsToTime(sunrise);

//     const start2 = secondsToTime(sunset);
//     sunset += interval2;
//     const end2 = secondsToTime(sunset);

//     const isColored = weekdayRows[closestDay]?.includes(i);
//     const isWednesdayColored = closestDay === 'Wednesday' && i === 28; // 25th row (index 24)

//     newTableData.push({
//       start1,
//       end1,
//       start2,
//       end2,
//       sNo: i + 1,
//       value1: i === 0 ? secondsToTime(interval1) : i === 1 ? secondsToTime(interval2) : i === 2 ? secondsToTime(totalSec) : i === 3 ? 'sunriseToday' : i === 4 ? 'sunsetToday' : i === 5 ? 'sunriseTmrw' : '',
//       value2: i === 3 ? sunriseToday : i === 4 ? sunsetToday : i === 5 ? sunriseTmrw : '',
//       isColored,
//       isWednesdayColored,
//       weekday: weekdayValues[closestDay][i]
//     });
//   }

//   newTableData.push({
//     start1: sunsetToday,
//     end1: '',
//     weekday: '',
//     start2: sunriseTmrw,
//     end2: '',
//     sNo: '',
//     value1: '',
//     value2: '',
//     isColored: false
//   });

//   // Send the new table data as a response
//   res.json({ newTableData });
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
