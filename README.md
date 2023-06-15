# Highlight text as it is being spoken, using Amazon Polly

# Instructions for creating the demo

## I. Prerequisite
Some commands described below require the AWS CLI.
You can install or update the latest version of AWS CLI from here: 
https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
    
## II. Create and deploy the stack using CloudFormation

### II-1. Download the source code from this gitrepo

### II-2. Create S3 buckets for the CloudFormation template and source code
A bucket needs to be created as below.
Bucket A: To hold the CloudFormation template (for example, varad-cf)
REGION: The region where you will be deploying the bucket and this code (such as us-east-1)

From AWS Console, create an s3 bucket to hold the cloud formation template (needed in step 3). Or create it using the CLI, as shown below.   
```aws s3api create-bucket --bucket [Bucket A] --region [REGION]```

In our example, the command would be  
```aws s3api create-bucket --bucket varad-cf --region us-east-1```

### II-3. Package and Deploy the CloudFormation template
#### For the commands below, 
Suffix:  A user supplied suffix to be used for the buckets created by CloudFormation. 
We need this to make sure your bucket names are unique. (for example, varad-123)
In your case, create your own unique Suffix.

You should be in the root directory where you downloaded the code from Github in step II-1

#### a. Create the CloudFormation package
In the root directory (where you downloaded the source code), type the below. This creates packaged.yaml in your root directory
The REGION is the same region where the bucket was created in Step II-2  
```aws cloudformation package --template-file pth-cf-root.yaml --output-template packaged.yaml --s3-bucket [Bucket A] --region [REGION]```

In our example, it would be  
```aws cloudformation package --template-file pth-cf-root.yaml --output-template packaged.yaml --s3-bucket varad-cf --region us-east-1```

#### b. Deploy the CloudFormation stack
In the root directory (where you downloaded the source code), type the below. This creates the CloudFormation stack in your AWS account.  It might take a few minutes to complete.  
```aws cloudformation deploy --template-file ./packaged.yaml  --stack-name pth-cf --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_IAM CAPABILITY_NAMED_IAM --parameter-overrides Suffix=[Suffix]```

In our example, it would be  
```aws cloudformation deploy --template-file ./packaged.yaml  --stack-name pth-cf --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_IAM CAPABILITY_NAMED_IAM --parameter-overrides Suffix=varad-123```

## III. Update the website code
For the next few steps, you should locate the CloudFormation stack that was deployed successfully from your AWS Console.  
See the screenshots below.

### III-1.  Note the API endpoint from the CloudFormation stack
Locate the API endpoint from the Outputs tab of the API nested stack in the CloudFormation stack (starts with pth-cf-APIGateway-)
Note the REST API endpoint ends in "/presigned"
Copy and store it in your notepad.  

![CloudFormation ApiGW Output](https://user-images.githubusercontent.com/113476214/236054278-9c8b3b68-4a5b-4906-b0e9-44c83b61da83.jpg)


### III-2. Enable CORS for the endpoint
Locate the API Gateway from the Resources tab of the API nested stack in the CloudFormation stack (starts with pth-cf-APIGateway-)
    
![CloudFormation ApiGW Resources](https://user-images.githubusercontent.com/113476214/236054356-d3c9634f-c17a-42ec-adcb-0c96aa8965ff.png)

In the API Gateway, locate the endpoint ending in "/presigned", enable CORS. Accept the defaults. 
Deploy API again after enabling CORS.  Choose Prod as the Stage.

![Enable Cors ApiGW](https://user-images.githubusercontent.com/113476214/236054452-cfba52ce-e79a-49ac-8d9c-9b573dea5d22.png)

### III-3. Update the API endpoint in the postblog.js page
a.  You should be in the root directory where you downloaded the code from Github in step II-1  
b.  Locate the file postblog.js in the website/js folder  
c.  Modify postBlogUrl in the first line with the API endpoint copied in step III-1  
d.  Save the file  

### III-4. Upload the code from website directory to the S3 bucket. 
Note the Suffix was created in step II-3  
```aws s3 cp website s3://pth-cf-text-highlighter-website-[Suffix] --recursive``` 

In our example, it would be  
```aws s3 cp website s3://pth-cf-text-highlighter-website-varad-123 --recursive``` 

## IV. Test the Text Highlighter feature from the browser

### IV-1. Get the CloudFront domain name
Locate the CloudFront domain name from the Outputs tab of the CloudFront nested stack in the CloudFormation stack 
(starts with pth-cf-CloudFrontDistribution-)

![CloudFront Distribution](https://user-images.githubusercontent.com/113476214/236054575-dc9d11ff-203d-4d26-8284-b548132cf80b.png)

### IV-2 Open the website pointed to by the domain name 
a.  You will see a simple web page with a form to enter text  
b.  Type a few words into the text box  
c.  Click on 'Speak It with Polly'  
d.  After a short pause, you will hear Polly play the audio and see the words being highlighted as they are being spoken  

## V. Clean Up
To clean up the resources created in this demo, follow the steps below

1.	Delete the S3 buckets created to store the CloudFormation template (Bucket A) and the website (pth-cf-text-highlighter-website-[Suffix]).  These buckets were created in Steps II-2, II-3  
2.	Delete the CloudFormation stack pth-cf created in II-3 (b)  
3.  Delete the S3 bucket containing the speech files (pth-speech-[Suffix]).  This bucket was created by the CloudFormation template to store the audio and speechmarks files generated by Polly.  

## VI. Troubleshooting
If the demo does not work, check the following:
1. Make sure the CloudFormation stack deployed without errors.  Go to CloudFormation and review the stack output to make sure all steps completed without errors. (step II-3b)
2. Make sure that CORS is enabled for the endpoint (step III-2).  Wait for a few seconds after the API is deployed before trying again.
3. Make sure that the text input is not very large to cause the Lambda function to timeout. (Default timeout = 3 seconds)
4. Review the CloudWatch Logs for the Lambda functions to see where the problem is.  From the Lambda console, pick the Lambda function, and then go to the Monitoring tab and review the latest CloudWatch log (based on time it was created).
5. Review the JavaScript console from the browser to see if there are any errors.

## Security
See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License
This library is licensed under the [MIT-0 License](https://opensource.org/license/mit-0/).


