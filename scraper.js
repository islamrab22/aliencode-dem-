import dotenv from 'dotenv';
dotenv.config();

const cities = [
  'Riyadh Saudi Arabia',
  'Jeddah Saudi Arabia', 
  'Kuwait City Kuwait',
  'Dubai UAE',
  'Abu Dhabi UAE',
  'Doha Qatar',
  'Muscat Oman'
];

const query = 'IT company software development';

async function searchGoogleMaps(city) {
  const searchQuery = `${query} ${city}`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  const results = [];
  for (const place of data.results || []) {
    const detail = await getPlaceDetails(place.place_id);
    if (detail.phone) {
      results.push({
        name: place.name,
        phone: detail.phone,
        address: place.formatted_address,
        city: city
      });
    }
  }
  return results;
}

async function getPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${process.env.GOOGLE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return { phone: data.result?.formatted_phone_number };
}

async function main() {
  const allLeads = [];
  for (const city of cities) {
    console.log(`Searching ${city}...`);
    const leads = await searchGoogleMaps(city);
    allLeads.push(...leads);
    console.log(`Found ${leads.length} leads in ${city}`);
  }
  
  import('fs').then(fs => {
    fs.writeFileSync('leads.json', JSON.stringify(allLeads, null, 2));
    console.log(`Total leads saved: ${allLeads.length}`);
  });
}

main();