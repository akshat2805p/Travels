import json
import urllib.parse

data = {
    'rajasthan': {'stateName': 'Rajasthan', 'cities': ['Jaipur', 'Udaipur', 'Jaisalmer']},
    'uttar_pradesh': {'stateName': 'Uttar Pradesh', 'cities': ['Agra', 'Varanasi', 'Lucknow']},
    'himachal_pradesh': {'stateName': 'Himachal Pradesh', 'cities': ['Shimla', 'Manali', 'Dharamshala']},
    'jammu_and_kashmir': {'stateName': 'Jammu and Kashmir', 'cities': ['Srinagar', 'Gulmarg', 'Pahalgam']},
    'uttarakhand': {'stateName': 'Uttarakhand', 'cities': ['Rishikesh', 'Nainital', 'Mussoorie']},
    'punjab': {'stateName': 'Punjab', 'cities': ['Amritsar', 'Chandigarh']},
    'haryana': {'stateName': 'Haryana', 'cities': ['Kurukshetra', 'Gurugram']},
    'delhi': {'stateName': 'Delhi', 'cities': ['New Delhi']},
    'kerala': {'stateName': 'Kerala', 'cities': ['Munnar', 'Alleppey', 'Kochi']},
    'tamil_nadu': {'stateName': 'Tamil Nadu', 'cities': ['Chennai', 'Madurai', 'Ooty']},
    'karnataka': {'stateName': 'Karnataka', 'cities': ['Bengaluru', 'Mysuru', 'Hampi']},
    'telangana': {'stateName': 'Telangana', 'cities': ['Hyderabad']},
    'andhra_pradesh': {'stateName': 'Andhra Pradesh', 'cities': ['Visakhapatnam', 'Tirupati']},
    'goa': {'stateName': 'Goa', 'cities': ['Panaji', 'Calangute', 'Palolem']},
    'maharashtra': {'stateName': 'Maharashtra', 'cities': ['Mumbai', 'Pune', 'Aurangabad']},
    'gujarat': {'stateName': 'Gujarat', 'cities': ['Ahmedabad', 'Rann of Kutch', 'Dwarka']},
    'madhya_pradesh': {'stateName': 'Madhya Pradesh', 'cities': ['Bhopal', 'Indore', 'Khajuraho']},
    'chhattisgarh': {'stateName': 'Chhattisgarh', 'cities': ['Raipur', 'Bastar']},
    'west_bengal': {'stateName': 'West Bengal', 'cities': ['Kolkata', 'Darjeeling']},
    'odisha': {'stateName': 'Odisha', 'cities': ['Bhubaneswar', 'Puri', 'Konark']},
    'bihar': {'stateName': 'Bihar', 'cities': ['Patna', 'Bodh Gaya', 'Nalanda']},
    'jharkhand': {'stateName': 'Jharkhand', 'cities': ['Ranchi', 'Deoghar']},
    'assam': {'stateName': 'Assam', 'cities': ['Guwahati', 'Kaziranga']},
    'meghalaya': {'stateName': 'Meghalaya', 'cities': ['Shillong', 'Cherrapunji']},
    'sikkim': {'stateName': 'Sikkim', 'cities': ['Gangtok', 'Pelling']},
    'arunachal_pradesh': {'stateName': 'Arunachal Pradesh', 'cities': ['Tawang', 'Ziro']},
    'nagaland': {'stateName': 'Nagaland', 'cities': ['Kohima', 'Mokokchung']},
    'manipur': {'stateName': 'Manipur', 'cities': ['Imphal']},
    'mizoram': {'stateName': 'Mizoram', 'cities': ['Aizawl']},
    'tripura': {'stateName': 'Tripura', 'cities': ['Agartala']},
    'andaman_and_nicobar': {'stateName': 'Andaman and Nicobar', 'cities': ['Port Blair', 'Havelock Island']},
    'lakshadweep': {'stateName': 'Lakshadweep', 'cities': ['Agatti Island', 'Bangaram']}
}

destinations = {}
for state_id, state_info in data.items():
    destinations[state_id] = {
        'stateName': state_info['stateName'],
        'cities': {}
    }
    for city in state_info['cities']:
        city_id = city.lower().replace(' ', '_')
        wiki = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(city)}"
        s_name = state_info["stateName"]
        destinations[state_id]['cities'][city_id] = {
            'title': city,
            'tagline': f'Explore the beautiful city of {city}',
            'image': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80',
            'overview': f'{city} is a renowned destination in {s_name}, offering distinct cultures, historical landmarks, and breathtaking landscapes.',
            'wikiUrl': wiki,
            'bestTime': 'October to March',
            'duration': '2-3 Days',
            'famousThings': [
                {
                    'title': f'{city} Attractions',
                    'desc': f'Discover the highly renowned places and vibrant culture of {city}.',
                    'icon': 'map-marker-alt',
                    'image': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop&q=80'
                }
            ],
            'packages': [
                {
                    'name': f'Essential {city} Tour',
                    'desc': f'A curated package covering the best of {city}.',
                    'duration': '2 Days / 1 Night',
                    'tags': ['Sightseeing', 'Guided Tour']
                }
            ]
        }

with open('destinations-data.js', 'w', encoding='utf-8') as f:
    f.write('const destinationsData = ' + json.dumps(destinations, indent=2) + ';')
print('Successfully generated destinations-data.js')
