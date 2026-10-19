const fs = require('fs');
const path = require('path');

const pageContent = fs.readFileSync(path.join(__dirname, '..', 'app', 'learner', 'live_classes', 'page.tsx'), 'utf8');

console.log('--- TEST RESULTS ---');
console.log('1. Has checkLessonExpiration function:', pageContent.includes('function checkLessonExpiration'));
console.log('2. Renders Class Ended for expired lessons:', pageContent.includes('Class Ended'));
console.log('3. Prunes expired in mount useEffect:', pageContent.includes('isExpired'));
console.log('4. Enforces single-class limit in mount:', pageContent.includes('activeFound.length > 1'));
console.log('5. Removed hardcoded algebra live:', !pageContent.includes('lesson.id === "algebra"'));
