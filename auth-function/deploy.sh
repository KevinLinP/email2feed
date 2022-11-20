gcloud functions deploy auth \
--gen2 \
--region=us-central1 \
--runtime=nodejs18 \
--memory=128MB \
--entry-point=function \
--trigger-http \
--allow-unauthenticated
