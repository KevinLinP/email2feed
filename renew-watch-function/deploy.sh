gcloud functions deploy renew-watch \
--gen2 \
--region=us-central1 \
--runtime=nodejs18 \
--memory=256Mi \
--trigger-topic=renew-watch-cron \
--entry-point=function \
--min-instances=0 \
--max-instances=1
