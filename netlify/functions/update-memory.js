const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    const { publicId, title, desc, fecha, catId, resourceType } = JSON.parse(event.body);

    const result = await cloudinary.uploader.explicit(publicId, {
      type:          'upload',
      resource_type: resourceType || 'image',
      context: {
        title:    title,
        sub:      desc,
        desc:     desc,
        fecha:    fecha,
        category: catId,
      },
    });

    console.log('Cloudinary result:', result.public_id);
    return { statusCode: 200, body: JSON.stringify({ ok: true, id: result.public_id }) };
  } catch(e) {
    console.error('Error:', e.message);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};