gcloud functions deploy renew-watch \
--gen2 \
--region=us-central1 \
--runtime=nodejs16 \
--memory=256Mi \
--trigger-topic=renew-watch-cron \
--entry-point=renewWatchFunction \
--min-instances=0 \
--max-instances=1
