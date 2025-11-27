// Netlify function для эмуляции Spark KV
const kvStore = new Map();

exports.handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/spark-kv', '');
  
  if (event.httpMethod === 'GET') {
    const value = kvStore.get(path);
    return {
      statusCode: value ? 200 : 404,
      body: value || ''
    };
  }
  
  if (event.httpMethod === 'POST') {
    kvStore.set(path, event.body);
    return {
      statusCode: 200,
      body: 'OK'
    };
  }
  
  return { statusCode: 405, body: 'Method not allowed' };
};
