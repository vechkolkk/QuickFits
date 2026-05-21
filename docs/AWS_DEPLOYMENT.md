# Deploying QuickFit to AWS

This guide uses MongoDB Atlas for the database, AWS Elastic Beanstalk for the Express API, and AWS Amplify for the React frontend. This is the most student-project-friendly AWS path because it avoids hand-managing EC2, Nginx, and SSL.

## 1. Prepare MongoDB Atlas

1. Create a free MongoDB Atlas cluster.
2. Create a database user.
3. Add your current IP address for local testing.
4. Add `0.0.0.0/0` only if needed for deployment demos, or use a stricter AWS outbound IP strategy for production.
5. Copy the connection string. It should look like:

   ```text
   mongodb+srv://USER:PASSWORD@cluster.mongodb.net/quickfit
   ```

## 2. Deploy Backend to AWS Elastic Beanstalk

1. In AWS, open Elastic Beanstalk.
2. Create a new application named `quickfit-api`.
3. Choose:
   - Platform: Node.js
   - Application code: Upload your code
4. Upload the repository as a ZIP, or connect through the EB CLI.
5. Set the Node command to:

   ```bash
   npm run start --workspace server
   ```

6. Add environment variables in Elastic Beanstalk configuration:

   ```text
   NODE_ENV=production
   PORT=8080
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=use_a_long_random_secret
   CLIENT_URL=https://your-amplify-domain.awsapps.com
   ```

7. Deploy and confirm:

   ```text
   https://your-eb-domain.elasticbeanstalk.com/health
   ```

## 3. Deploy Frontend to AWS Amplify

1. Open AWS Amplify.
2. Choose "Deploy an app" and connect your GitHub repository.
3. Select the branch you pushed.
4. Use these build settings:

   ```yaml
   version: 1
   applications:
     - appRoot: client
       frontend:
         phases:
           preBuild:
             commands:
               - npm install
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: dist
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```

5. Add an Amplify environment variable:

   ```text
   VITE_API_URL=https://your-eb-domain.elasticbeanstalk.com/api
   ```

6. Redeploy the frontend.

## 4. Update CORS

After Amplify gives you a final frontend URL, update Elastic Beanstalk:

```text
CLIENT_URL=https://your-amplify-domain.awsapps.com
```

Redeploy/restart the backend environment.

## 5. Production Checks

- Register a new user.
- Log in.
- Create a workout.
- Create and check off a habit.
- Confirm dashboard numbers update.
- Confirm direct refresh works on frontend routes.

## Alternative AWS Frontend: S3 + CloudFront

If you prefer static hosting:

1. Run `npm run build --workspace client`.
2. Upload `client/dist` to an S3 bucket configured for static website hosting.
3. Put CloudFront in front of the bucket.
4. Set `VITE_API_URL` before building.

Amplify is recommended for this project because it automatically rebuilds when you push to GitHub.
