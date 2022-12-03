gcloud functions deploy feed \
--gen2 \
--region=us-central1 \
--runtime=nodejs16 \
--memory=256Mi \
--entry-point=feedFunction \
--trigger-http \
--allow-unauthenticated \
--min-instances=0 \
--max-instances=1
