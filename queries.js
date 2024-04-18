const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'project',
  password: 'Group59',
  port: 5432,
})

const getUsers = (request, response) => {
  pool.query('SELECT * FROM person ORDER BY pid ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createUser = (request, response) => {
  const {pid, gender, age, blood_grp, fname, lname, city, pin_code, email, eid} = request.body

    pool.query('CALL insert_person_data($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [pid, gender, age, blood_grp, fname, lname, city, pin_code, email, eid], (error, results) => {
    if (error) {
        if (error.message && error.message.includes('under 18 years')) {
            response.status(400).json({ error: error.message });
        } else {
            console.error('Error inserting blood report:', error);
            response.status(500).json({ error: 'An error occurred while adding the blood report.' });
        }
        return;
    }
    response.status(201).send(`User added with ID: ${results.insertId}`)
  })
}

const createDonor = (request, response) => {
    const {pid,quantity_don} = request.body

      pool.query('INSERT INTO donor (pid, quantity_don) VALUES ($1,$2)', [pid, quantity_don], (error, results) => {
      if (error) {
          if (error.message && error.message.includes('under 18 years')) {
              response.status(400).json({ error: error.message });
          } else {
              console.error('Error inserting blood report:', error);
              response.status(500).json({ error: 'An error occurred while adding the blood report.' });
          }
          return;
      }
      response.status(201).send(`User added with ID: ${results.insertId}`)
    })
  }


  const createRecipient = (request, response) => {
    const {pid,curr_disease} = request.body

      pool.query('INSERT INTO recipient (pid, curr_disease) VALUES ($1,$2)', [pid, curr_disease], (error, results) => {
      if (error) {
          if (error.message && error.message.includes('No available blood stock')) {
              response.status(400).json({ error: error.message });
          } else {
              console.error('Error inserting blood report:', error);
              response.status(500).json({ error: 'An error occurred while adding the blood report.' });
          }
          return;
      }
      response.status(201).send(`User added with ID: ${results.insertId}`)
    })
  }

const getByCity = async (request, response) => {
    try {
      const city = request.query.city;
      const blood_grp = request.query.blood_grp;
      //console.log(id);
      // Validate id (implementation omitted for brevity)
  
      const results = await pool.query('select findbycity($1,$2);', [city,blood_grp]);
      response.status(200).json(results.rows);
    } catch (error) {
      console.error(error);
      response.status(400).json({ error: 'Failed to retrieve user' });
    }
  }


  const getByComponents = async (request, response) => {
    try {
      const rbc = request.query.rbc;
      const wbc = request.query.wbc;
      const haemoglobin = request.query.haemoglobin;
      //console.log(id);
      // Validate id (implementation omitted for brevity)
  
      const results = await pool.query('select getbycomponents($1,$2,$3);', [rbc,wbc,haemoglobin]);
      response.status(200).json(results.rows);
    } catch (error) {
      console.error(error);
      response.status(400).json({ error: 'Failed to retrieve user' });
    }
  }


const createBloodReport = (request, response) => {
    const {rid, wbc, rbc, haemoglobin, blood_grp, stid, pid} = request.body;
  
    pool.query('INSERT INTO Blood_report (rid, wbc, rbc, haemoglobin, blood_grp, stid, pid) VALUES ($1,$2,$3,$4,$5,$6,$7)', [rid, wbc, rbc, haemoglobin, blood_grp, stid, pid], (error, results) => {
        if (error) {
            // Check if the error message contains the specific exception for invalid blood group
            if (error.message && error.message.includes('Invalid blood group')) {
                response.status(400).json({ error: error.message });
            } else {
                console.error('Error inserting blood report:', error);
                response.status(500).json({ error: 'An error occurred while adding the blood report.' });
            }
            return;
        }
        response.status(201).send(`Blood Report added with ID: ${results.insertId}`);
    });
}
// hardik part
const getemp=async(req,res)=>{

  const input=req.body["emp_detail"];
  
  const result=await pool.query("select count(*),e.fname as fname from person p, employee e  where p.eid=$1 and p.eid=e.eid group by p.eid,e.fname",[input]);
  
  if(result.rows.length==0)
  {
    res.render("queries.ejs",{
      error1:"No data found"
    });
  }
  else{const data=result.rows[0];
    const fname=data.fname;
    const num=data.count;
    res.render("queries.ejs",{
      number:num,
      name:fname,

    });

  }

}
const getpatients=async(req,res)=>{

  const input=req.body["person"];
  const data =await pool.query("select r.rbc,r.wbc,p.fname from blood_report r, recipient w ,person p where w.pid=r.pid and r.pid=p.pid and w.curr_disease=$1 ",[input]);
  if(data.rows.length>0){
  res.render("queries.ejs",{
   rows:data.rows
  });
}
else{
  res.render("queries.ejs",{error:"No such patients found"});
}
}
const getdonor=async(req,res)=>{

  const {city,BG}=req.body;
  console.log(city);
  console.log(BG);
  const result=await pool.query("select p.fname,d.quantity_don from person p , donor d, blood_report r where p.pid=d.pid and p.pid=r.pid and r.rbc>100000 and r.haemoglobin>11 and p.age>18 and p.city=$1 and p.blood_grp=$2 ",[city,BG]);
  if(result.rows.length>0)
  {
    res.render("queries.ejs",{
      rows:result.rows
    });
  }
  else{
    res.render("queries.ejs",{error2:"No donor found "});

  }

};
module.exports = {
   getUsers,
   createUser,
   createBloodReport,
   getByCity,
   createDonor,
   createRecipient,
   getByComponents,
   getemp,
   getpatients,
   getdonor,
}