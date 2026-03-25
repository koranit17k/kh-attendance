ขั้นตอนการทำงาน
1. pnpm install vue,nuxt
2. ทำ component
3. เอาcomponent ใส่หน้าเว็บ
4. ทำ Database โดยสร้าง table ชื่อ counter
5. สร้างโฟลเดอร์ server เพื่อให้นำมาใช้เป็น api
 - api เพื่อเป็นตัวรับส่งข้อมูล ที่ได้จากการนับข้อมูลในเว็บ
 - middleware เพื่อเป็นการนับ session,cookie ในเว็บ
 - utils เพื่อเป็นการเชื่อมกับ database
6. รัน local โดยใช้คำสั่ง pnpm dev 
7. หลังจากนั้น เข้าไปในหน้าเว็บ และลอง save และเข้าไปเช็คใน database (table counter)
