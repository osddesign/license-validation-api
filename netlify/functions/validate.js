const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
});

exports.handler = async (event) => {
  // Headers CORS
  const headers = {
    "Access-Control-Allow-Origin":
      "https://beamish-cupcake-5f0295.netlify.app/.netlify/functions",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  try {
    const { key } = JSON.parse(event.body);
    const doc = await firestore.collection("licenses").doc(key).get();

    if (!doc.exists) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ valid: false }),
      };
    }

    const data = doc.data();
    const valid =
      data.status === "active" &&
      new Date(data.valid_until) > new Date() &&
      data.activations < data.max_activations;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid,
        activations_left: data.max_activations - data.activations,
        expires: data.valid_until,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
