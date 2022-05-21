const { Client } = require("pg");

(async () => {
  const client = new Client(
    "postgresql://duy:l1wDwh5p9PiQCwvTCjFZBQ@free-tier9.gcp-us-west2.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&options=--cluster%3Dspotty-gnoll-517"
  );

  const statements = [
    // CREATE the messages table
    "DROP TABLE IF EXISTS public.messages",
  ];

  try {
    // Connect to CockroachDB
    await client.connect();
    for (let n = 0; n < statements.length; n++) {
      let result = await client.query(statements[n]);
      if (result.rows[0]) {
        console.log(result.rows[0].message);
      }
    }
    await client.end();
  } catch (err) {
    console.log(`error connecting: ${err}`);
  }

  // Exit program
  process.exit();
})().catch((err) => console.log(err.stack));
