# Written Demo

Once everything is loaded, we can proceed to change to Test Account 2. We can see that the current balance of Test Account 2 is 0 TOK (our Test Token). We can also see from the App Bar that currently the `WhitelistPaymaster` is being used.

![image](https://user-images.githubusercontent.com/48687942/142754720-6d45e678-8fbb-4031-98ad-27d0a5c59b49.png)

## Mint some test tokens

Let't mint some token for testing:

![image](https://user-images.githubusercontent.com/48687942/142754732-b1447a94-eeb6-4278-8e43-cb64ae74938d.png)

There will be a prompt to sign the transaction:

![image](https://user-images.githubusercontent.com/48687942/142754737-eb409fd8-a54a-40bd-83b8-051bfecd75e0.png)

Once, minting is done successfully, the success prompt will appear.

![image](https://user-images.githubusercontent.com/48687942/142754742-2fe22f92-9c24-4b13-8b04-80b35590e9de.png)

We can verify that our balance is now 100 TOK as seen from the top right corner:

![image](https://user-images.githubusercontent.com/48687942/142754746-789a25f2-e0e0-453b-bb23-416ba6afeac0.png)

You can also verify it in your metamask account

![image](https://user-images.githubusercontent.com/48687942/142754755-35a23fa5-1a14-4fa4-9ae8-4af2319bcb84.png)

<br /><br />

## Transfer using Whitelist Paymaster

Now we will try to transfer 10 tokens to `Test Account 3`

![image](https://user-images.githubusercontent.com/48687942/142754776-3c79427a-9a7b-411d-aac6-52e17d5a3b9c.png)

Sign the prompt:

![image](https://user-images.githubusercontent.com/48687942/142754780-5ecc494c-b384-4b07-aab5-e9ee238ccb9c.png)
![image](https://user-images.githubusercontent.com/48687942/142754783-5dc569d2-7bd5-4d82-9f5e-4a4b4ee0c54d.png)

Once transfer is done, we can see the success prompt:

![image](https://user-images.githubusercontent.com/48687942/142754788-981927b7-ba38-48d0-86a9-1695fe630747.png)

We can also see that our balance has now been deducted 10 TOK, is now left with 90 TOK.

![image](https://user-images.githubusercontent.com/48687942/142754791-882bb509-add0-4069-9f68-29a7c1328278.png)

We can also navigate to Test Account 3, and see that it now has 10 TOK

![image](https://user-images.githubusercontent.com/48687942/142755586-13b6c660-cb46-4f87-a103-2e5745ef3688.png)

<br /><br />

## Transfer using Token Paymaster

First, from the Nav Bar, navigate to switch the paymaster implementations:

![image](https://user-images.githubusercontent.com/48687942/142754803-e3d8f8d9-eff2-4b1d-b7e4-1d51c2eda1f0.png)

Click on TokenPaymaster to switch:

![image](https://user-images.githubusercontent.com/48687942/142754812-b126e4b4-f032-4bdd-bfdb-5ab7a8e923b5.png)

Now we can repeat the same process, from `Test Account 2`, transfer 10 TOK to `Test Account 3`

![image](https://user-images.githubusercontent.com/48687942/142754822-9acbd695-f07d-46dd-b5dc-4fc41decfc23.png)
![image](https://user-images.githubusercontent.com/48687942/142754832-c1ca0d97-2e71-4936-9981-a523e6750755.png)

After everything is done, we can see that instead of being left with 80 TOK, the account is left with 79.9... TOK. This is because some of the TOK has been deducted to pay for the gas fee and transaction fee.

![image](https://user-images.githubusercontent.com/48687942/142754895-997c8c2a-7811-461c-9bbe-38d0c6427fbb.png)
