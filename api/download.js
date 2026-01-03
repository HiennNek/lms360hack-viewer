const axios = require('axios');

module.exports = async (req, res) => {
    // Add CORS headers for Vercel serverless functions
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).send('ID is required');
    }

    const downloadUrl = `https://lms360.vn/h5p/download/${id}`;

    try {
        console.log(`[Vercel API] Fetching H5P file for ID: ${id} from ${downloadUrl}`);
        const response = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream',
        });

        // Forward the headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="h5p-${id}.h5p"`);

        response.data.pipe(res);
    } catch (error) {
        console.error('[Vercel API] Error fetching H5P file:', error.message);
        res.status(500).send('Failed to fetch H5P file from lms360.vn');
    }
};
