import { RowDataPacket } from "mysql2";//тип строки, полученной из mysql2 для того чтоб вытащить массив строк из результатов запроса
import db from "../config/db.js";

interface VaiheRow extends RowDataPacket {// описывает структуру строки, полученной из БД
  id: number;
  vaihe: string;
  selitys: string;
}

class Vaihe { //сам класс нашей модели вытащенной из БД - т.е. бизнес-модель этапа
  id: number;
  vaihe: string;
  selitys: string;

  constructor(id: number, vaihe: string, selitys: string) {
    this.id = id;
    this.vaihe = vaihe;
    this.selitys = selitys;
  }

 static async findAllVaiheet(): Promise<Vaihe[]> {
    const sql = "SELECT * FROM vaiheet;";
    const [rows] = await db.execute<VaiheRow[]>(sql);// получили из БД массив строк типа VaiheRow[]

    const vaiheet:Vaihe[] = rows.map(row => new Vaihe(row.id, row.vaihe, row.selitys)) // преобразовали строки БД в объекты класса Vaihe

    return vaiheet;
  }

  static async getSelitys(v:string): Promise<string | null> {
    const sql = "SELECT selitys FROM vaiheet WHERE vaihe = ?"; //? - использую параметр, смотри сюда на V: db.execute(sql,[v])
    const [rows] = await db.execute(sql,[v]); //получаю обьект типа [rows, fields], но т.к. я беру только [rows], то rows содержит только первый элемент rows, а первый элемент уже самого rows = rows[0] выглядит как {selitys: "viimeistelyvaiheessa ..."}
    const selitys = (rows as any[]).length > 0 //использую rows as any[] чтоб TypeScript поверил что у него есть метод .length 
    ? (rows as any[])[0].selitys //и .selitys 
    : null;   

    return selitys;
  }
}

  export default Vaihe;

