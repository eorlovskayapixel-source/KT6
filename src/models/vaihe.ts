import { RowDataPacket } from "mysql2"; // row type returned by mysql2 queries
import db from "../config/db.js";

// Shape of a row in the "vaiheet" table
interface VaiheRow extends RowDataPacket {
  id: number;
  vaihe: string;
  selitys: string;
}

// Domain model for a thesis stage (vaihe) and its explanation (selitys)
class Vaihe {
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
    const [rows] = await db.execute<VaiheRow[]>(sql);

    // Map database rows to Vaihe objects
    const vaiheet: Vaihe[] = rows.map(row => new Vaihe(row.id, row.vaihe, row.selitys));

    return vaiheet;
  }

  static async getSelitys(v:string): Promise<string | null> {
    // Parameterized query: the value of v is passed separately to prevent SQL injection
    const sql = "SELECT selitys FROM vaiheet WHERE vaihe = ?";
    // execute() returns [rows, fields]; rows[0] looks like { selitys: "..." }
    const [rows] = await db.execute(sql, [v]);
    const selitys = (rows as any[]).length > 0
    ? (rows as any[])[0].selitys
    : null;   

    return selitys;
  }
}

  export default Vaihe;

