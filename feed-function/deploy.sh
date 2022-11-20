gcloud functions deploy feed \
--gen2 \
--region=us-central1 \
--runtime=nodejs18 \
--memory=256MB \
--entry-point=function \
--trigger-http \
--allow-unauthenticated
