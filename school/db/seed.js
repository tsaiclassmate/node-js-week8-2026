/**
 * 任務 5：Seeder，種一些資料，證明你建立的資料表真的能使用。
 * 規則：可重複執行（先清空、再種入資料），即使執行多次也不會有資料疊加的狀況。
 * 執行順序：一定要先 npm run migration:run（沒有資料表，就無法種資料）
 */
const { dataSource } = require('./data-source')

/** 清空：被 FK 指著的表最後刪（GRADE 先刪，CLASS / SUBJECT 最後刪）。
 *  不用 clear()（TRUNCATE 會被 FK 擋）、不用 delete({})（TypeORM 拒絕空條件）。 */
async function clearAll() {
  const ORDER = [
    // TODO: 按「你的」FK 依賴順序填 entity name（先刪 Grade，再 Student，最後 Class / Subject）
     'Grade', 
     'Student', 
     'Class', 
     'Subject', 
  ]
  for (const name of ORDER) {
    if (dataSource.hasMetadata(name)) {
      await dataSource.createQueryBuilder().delete().from(name).execute()
    }
  }
}

async function main() {
  await dataSource.initialize()
  await clearAll()

  // ================================================================================
  // TODO：依照任務內容的規格種資料（至少 2 班、2 科目、幾位學生、幾筆成績）
  //   1. 先種 CLASS / SUBJECT
  //   2. 再種 STUDENT（記得接上 class）
  //   3. 最後種 GRADE（記得接上 student + subject）
  //      關聯的接法：relation 屬性直接放前面存好的物件（TypeORM 會自動取出 id 填進外鍵），例如：
  //      studentRepo.save({ name: '...', class: 班級物件 })
  //      gradeRepo.save({ score: 95, student: 學生物件, subject: 科目物件 })
  // ================================================================================

  // ============================================================ 
  // // 1. CLASS / SUBJECT // 
  // ============================================================ 
  const classRepo = dataSource.getRepository('Class') 
  const subjectRepo = dataSource.getRepository('Subject') 
  const classA = await classRepo.save({ name: '一年甲班', }) 
  const classB = await classRepo.save({ name: '一年乙班', }) 
  const chinese = await subjectRepo.save({ name: '國文', }) 
  const math = await subjectRepo.save({ name: '數學', })
  // ============================================================ // 
  // 2. STUDENT 
  // // ============================================================ 
   const studentRepo = dataSource.getRepository('Student') 
   const student1 = await studentRepo.save({ name: '王小明', class: classA, }) 
   const student2 = await studentRepo.save({ name: '李小美', class: classA, })
   const student3 = await studentRepo.save({ name: '陳大華', class: classB, }) 
   // ============================================================ // 
   // 3. GRADE 
   // // ============================================================ 
    const gradeRepo = dataSource.getRepository('Grade') 
    await gradeRepo.save([ { score: 85, student: student1, subject: chinese, }, 
      { score: 90, student: student1, subject: math, }, 
      { score: 78, student: student2, subject: chinese, },
       { score: 88, student: student2, subject: math, }, 
       { score: 92, student: student3, subject: chinese, }, 
       { score: 86, student: student3, subject: math, }, 
      ])


  console.log('🌱 seed 完成')
  await dataSource.destroy()
}

main().catch((e) => { console.error('seed 失敗：', e.message); process.exit(1) })
