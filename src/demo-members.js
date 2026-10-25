export const memberRoleLabels={MEMBER:'一般會員',MANAGER:'管理員',ADMIN:'系統 admin'};
export const memberFieldLabels={name:'姓名',nickname:'綽號',phone:'聯絡電話',emergencyName:'緊急聯絡人',emergencyPhone:'緊急聯絡人電話',division:'預設參賽組別',social:'社群資料'};
export const initialDemoMembers=[
 {id:'member-1',number:'MBR-0001',name:'示範選手甲',nickname:'林間小鹿',email:'demo-1@example.test',residency:'DOMESTIC',role:'MEMBER',division:'OPEN',joined:'2026-09-10'},
 {id:'member-2',number:'MBR-0002',name:'示範選手乙',nickname:'山徑',email:'demo-2@example.test',residency:'DOMESTIC',role:'MANAGER',division:'ME',joined:'2026-09-12'},
 {id:'member-3',number:'MBR-0003',name:'示範選手丙',nickname:'Forest Runner',email:'demo-3@example.test',residency:'FOREIGN',role:'MEMBER',division:'MA',joined:'2026-09-18'},
 {id:'member-4',number:'MBR-0004',name:'示範選手丁',nickname:'',email:'demo-4@example.test',residency:'DOMESTIC',role:'MEMBER',division:'WE',joined:'2026-10-02'},
 {id:'member-5',number:'MBR-0005',name:'示範選手戊',nickname:'指南針',email:'demo-5@example.test',residency:'DOMESTIC',role:'MEMBER',division:'WA',joined:'2026-10-08'},
 {id:'member-admin',number:'MBR-0006',name:'示範系統管理員',nickname:'森林領隊',email:'admin@example.test',residency:'DOMESTIC',role:'ADMIN',division:'OPEN',joined:'2026-09-01'},
].map(person=>({...person,phone:'0900000000',emergencyName:'示範聯絡人',emergencyPhone:'0900000001',social:'',revision:1,history:[]}));
