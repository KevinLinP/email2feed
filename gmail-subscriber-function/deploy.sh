gcloud functions deploy gmail-subscriber \
--gen2 \
--region=us-central1 \
--runtime=nodejs18 \
--memory=256Mi \
--trigger-topic=gmail \
--entry-point=function \
--min-instances=0 \
--max-instances=1
