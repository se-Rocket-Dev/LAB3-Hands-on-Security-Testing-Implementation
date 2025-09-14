async function selfTest() {
  const pool = await sql.connect(dbConfig);
  const r = await pool.request().query('SELECT @@SERVERNAME AS server_name, @@SERVICENAME AS service_name');
  console.log('Connected to:', r.recordset[0]);
}
selfTest().catch(console.error);
