import { test } from '@playwright/test';
import { Application } from "../app";
import { API, UserCreateRequest, UserCreatedResponse } from '../api';
import { randomUUID } from 'node:crypto';

export const baseFixture = test.extend<{ app: Application }>({
    app: async ({ page }, use) => {
        const app = new Application(page);
        await use(app);
    },
});

export const loggedUserFixture = baseFixture.extend<{ defaultUser: { email: string, password: string } } & { app: Application }>({
    defaultUser: [{
        email: 'test+1692462339712@test.com',
        password: '123456'
    }, { option: true }],

    app: async ({ app, defaultUser }, use) => {
        await app.signIn.open();
        await app.signIn.signIn(defaultUser);
        await app.accountDetails.expectLoaded();

        await use(app);
    },
});

interface UserContext { user: { userModel: UserCreateRequest, createdUser: UserCreatedResponse} }

export const loggedInAsNewUserFixture = baseFixture.extend<UserContext>({
    user: async ({ app, page }, use) => {
        const userModel = {
            isSubscribed: false,
            email: `test+${randomUUID()}@test.com`,
            firstName: "test",
            lastName: "test",
            password: "xotabu4@gmail.com"
        };

        const createdUser = await new API().createNewUser(userModel)

        // page.context().addInitScript()
        await app.signIn.open();
        // await app.signIn.signIn(userModel);
        await page.evaluate((token) => {
            window.localStorage.setItem('token', token)
        }, createdUser.token);
        await app.home.open();

        // await app.accountDetails.expectLoaded();

        await use({ userModel, createdUser});
    },
});