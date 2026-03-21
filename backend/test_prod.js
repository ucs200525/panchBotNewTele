const axios = require('axios');
const fs = require('fs');

async function test() {
    try {
        const response = await axios.post('https://tele-panch-backend.vercel.app/api/combine-image', {
            city: 'Hyderabad',
            date: '2026-03-21',
            muhuratData: [
                { muhurat: 'Shubha', category: 'Good', time: '06:11 AM to 07:31 AM' }
            ],
            panchangamData: [
                { weekday: 'Saturday', timeInterval1: '06:11 AM to 07:31 AM' }
            ]
        }, { responseType: 'arraybuffer' });

        fs.writeFileSync('test_prod_from_node.png', response.data);
        console.log('Successfully saved test_prod_from_node.png');
        console.log('Response content-type:', response.headers['content-type']);
        console.log('Size:', response.data.length, 'bytes');
    } catch (e) {
        console.error('Error during test:', e.message);
        if (e.response) console.error('Response data:', e.response.data.toString());
    }
}
test();
