try {
    require('express-session');
    console.log('express-session found');
} catch (e) {
    console.error('express-session missing');
}
try {
    require('ejs');
    console.log('ejs found');
} catch (e) {
    console.error('ejs missing');
}
try {
    require('connect-mongo');
    console.log('connect-mongo found');
} catch (e) {
    console.error('connect-mongo missing');
}
try {
    require('cookie-parser');
    console.log('cookie-parser found');
} catch (e) {
    console.error('cookie-parser missing');
}
