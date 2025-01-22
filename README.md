השחקן לוחץ על כפתור שמעביר את הקורדינטות שלו לפונקציה ב frontend שעושה emit ל websocket(יש connection פר שחקן).
ה backend מבין לפי ה connection אם השחקן הוא x או עיגול ומעדכן את ה state בזיכרון של המיקרוסרביס ועושה broadcast לכל ה clients למהלך האחרון.
ה frontend אז מעדכן את המהלך האחרון בלוח .

השתמשתי ב socket.io
מחלקות: 
ל state - gameState
ל socket handler בצד השרת - gameGateway הוא גם אחראי ללוגיקה
בדיעבד הייתי מפריד למחלקת gameLogic.

תנאי הניצחון הם בדיקה של שורות עמודות ו2 סוגי האלכסונים.


הוראות הפעלה:
ב frontend לחיצה על index.html
ב backend להריץ
npm run start

רציתי ליצור 
docker image
 אבל לא הספקתי