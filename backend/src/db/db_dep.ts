import mariadb from 'mariadb';
import {user, cabinetList, cabinetInfo} from '../user';

const con = mariadb.createPool({
	host: 'localhost',
	user: 'root',
	password: '',
	database: '42cabi_DB',
	dateStrings: true
});

export async function connection(queryFunction:Function) {
    let pool:mariadb.PoolConnection;
    try{
        pool = await con.getConnection();
		await queryFunction(pool);
		if (pool) pool.end();
    }catch(err){
	    console.log(err);
        throw err;
    }
}

export async function connectionForCabinet(){
	if (cabinetList.location?.length)
		return ;
	let pool: mariadb.PoolConnection;
	try{
		pool = await con.getConnection();
		//location info
		const content1:string = `select distinct cabinet.location from cabinet`;
		const result1 = await pool.query(content1);
		result1.forEach(async (element1:any) => {
			cabinetList.location?.push(element1.location);
			//floor info with exact location
      const content2:string = `select distinct cabinet.floor from cabinet where location='${element1.location}' order by floor`;
      let floorList:Array<number> = [];
			let list:Array<Array<string>> = [];
      let tmpCabinetList:Array<Array<Array<cabinetInfo>>> = [];

		  const result2 = await pool.query(content2);
	    result2.forEach(async (element2:any) => {
				floorList.push(element2.floor);
				//section info with exact floor
			  const content3:string = `select distinct cabinet.section from cabinet where location='${element1.location}' and floor=${element2.floor} order by section`;
        let sectionList:Array<string> = [];
        let cabinetList:Array<Array<cabinetInfo>> = [];

        const result3 = await pool.query(content3)
        result3.forEach(async (element3:any) => {
					sectionList.push(element3.section);
          //cabinetList.push(getCabinetInfo(client, location, floor, element.section));
          const content4:string = `select * from cabinet where location='${element1.location}' and floor=${element2.floor} and section='${element3.section}' and activation=1 order by cabinet_num`;
          let lastList:Array<cabinetInfo> = [];

          const result4 = await pool.query(content4);
          result4.forEach(async (element4:any) => {
						lastList.push(element4);
          })
          cabinetList.push(lastList);
        });
				list.push(sectionList);
        tmpCabinetList.push(cabinetList);
      });
    	cabinetList.floor?.push(floorList);
			cabinetList.section?.push(list);
			cabinetList.cabinet?.push(tmpCabinetList);
    });
	if (pool) pool.release();
  }catch(err){
	console.log(err);
    throw err;
  }
}

export async function connectionForLent(queryFunction:Function, cabinet_id:number) {
    let pool;
    try{
        pool = await con.getConnection()
		await queryFunction(pool, cabinet_id);
		if (pool) pool.end();
    }catch(err){
		console.log(err);
        throw err;
    }
}