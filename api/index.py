from flask import Flask, request, jsonify
from apiclient.discovery import build
import os
from dotenv import load_dotenv
from typing import Any, List, Dict

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
dotenv_path = os.path.join(project_root, '.env.local')

load_dotenv(dotenv_path)

app = Flask(__name__)

API_KEY = os.getenv('API_KEY')
if not API_KEY:
    raise ValueError("No API_KEY set for Google Trends API")
SERVER = 'https://trends.googleapis.com'
API_VERSION = 'v1beta'
DISCOVERY_URL_SUFFIX = '/$discovery/rest?version=' + API_VERSION
DISCOVERY_URL = SERVER + DISCOVERY_URL_SUFFIX
MAX_QUERIES = 30

class Timeline:
    def __init__(self):
        self.service = self.get_client()
    
    def get_client(self) -> Any:
        return build('trends', API_VERSION, developerKey=API_KEY,
                     discoveryServiceUrl=DISCOVERY_URL)

    def get_search_volumes(
        self,
        terms: List[str], 
        start_date: str, 
        end_date: str, 
        frequency: str,
        geo_restriction: str,
        geo_restriction_option: str
    ) -> List[Dict[str, Any]]:
        if geo_restriction == 'country':
            req = self.service.getTimelinesForHealth(
                terms=terms, time_startDate=start_date,
                time_endDate=end_date,
                timelineResolution=frequency,
                geoRestriction_country=geo_restriction_option
            )
        elif geo_restriction == 'dma':
            req = self.service.getTimelinesForHealth(
                terms=terms,
                time_startDate=start_date,
                time_endDate=end_date,
                timelineResolution=frequency,
                geoRestriction_dma=geo_restriction_option
            )
        elif geo_restriction == 'region':
            req = self.service.getTimelinesForHealth(
                terms=terms,
                time_startDate=start_date,
                time_endDate=end_date,
                timelineResolution=frequency,
                geoRestriction_region=geo_restriction_option
            )

        response = req.execute()
        
        timeline_data = response.get('lines', [])
        
        data = []
        for line in timeline_data:
            term = line['term']
            for point in line['points']:
                data.append({
                    'term': term,
                    'date': point['date'],
                    'value': point['value']
                })
        
        return data

    def get_related(
            self,
            term: str,
            geography: str,
            start_date: str,
            end_date: str,
            type: str
    ):
        if type == 'topic':
            return self.service.getTopTopics(
                term=term, 
                restriction_geo=geography,
                restrictions_startDate=start_date,
                restrictions_endDate=end_date,
            ).execute()
        else:
            return self.service.getTopQueries(
                term=term, 
                restriction_geo=geography,
                restrictions_startDate=start_date,
                restrictions_endDate=end_date,
            ).execute()

@app.route('/api/search_volumes', methods=['POST'])
def search_volumes():
    data = request.json
    search = Timeline()
    
    results = search.get_search_volumes(
        terms=data['terms'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        frequency=data['frequency'],
        geo_restriction=data['geo_restriction'],
        geo_restriction_option=data['geo_restriction_option']
    )
    
    return jsonify(results)


'''
@app.route('/api/related', methods=['POST'])
def related():
    data = request.json
    search = Timeline()
    
    result = search.get_related(
        term=data['term'],
        geography=data['geography'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        type=data['type']
    )
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
'''