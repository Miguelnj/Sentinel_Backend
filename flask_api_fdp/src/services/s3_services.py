import boto3

s3_client = boto3.client('s3', config=boto3.session.Config(signature_version='s3v4'), region_name="eu-west-1")

s3 = boto3.resource('s3', config=boto3.session.Config(signature_version='s3v4'), region_name="eu-west-1",)


def download_file(file_name, downloaded_file):
    bucket_download = "assistance-check-videos"
    s3.Bucket(bucket_download).download_file(file_name, downloaded_file)


def upload_file(file_name):
    bucket_upload = "assistance-check-images"
    s3_client.upload_file(file_name, bucket_upload, file_name)
