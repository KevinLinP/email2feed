gcloud functions deploy feed \
--gen2 \
--region=us-central1 \
--runtime=nodejs18 \
--memory=256Mi \
--entry-point=function \
--trigger-http \
--allow-unauthenticated \
--min-instances=0 \
--max-instances=1
