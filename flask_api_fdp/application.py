from flask import Flask
from flask import request
import json
import os
import src.services.video_processing as processing
import src.services.s3_services as aws

application = Flask(__name__)


@application.route('/', methods=['GET'])
def index():
    file_name = request.args.get('file')
    aws.download_file(file_name, file_name)
    filenames = processing.process_video(file_name)
    for file in filenames:
        aws.upload_file(file)
        os.remove(file)
    os.remove(file_name)
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


if __name__ == "__main__":
    application.run(host="0.0.0.0")
