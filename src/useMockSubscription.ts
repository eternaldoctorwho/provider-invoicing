import * as Mock from './mock-data';
import { SubscriptionState, SubRecord } from '@dmg/core/dist/subscription';
import { useState, useEffect } from 'react';

type SubscriptionType = "user-context" | "invoice" | "provider-rating";

type MockSubscribableDef = {
    source: "mock",
    subscription: SubscriptionType,
};

type ReadySubscription = {
    status: "ready",
    data: ReadonlyArray<SubRecord<any>>,
};

type Value = Mock.MockTypes.UserContext
    | Mock.MockTypes.ProviderJob
    | Mock.MockTypes.ProviderRating;

const MOCK_WAIT_TIMES: { [subType in SubscriptionType]: number } = {
    "user-context": 250,
    "invoice": 1000,
    "provider-rating": 1000,
}

const getMockData = <TArgs, TValue extends Value>(subscription: MockSubscribableDef['subscription'], args: TArgs): ReadonlyArray<SubRecord<TValue>> => {
    switch (subscription) {
        case "user-context":
            return [{ key: String(args), value: <TValue>Mock.MOCK_USER_CONTEXT }];
        case "invoice":
            return [{ key: String(args), value: <TValue>Mock.MOCK_PROVIDER_JOB }];
        case "provider-rating":
            return [{ key: String(args), value: <TValue>Mock.MOCK_PROVIDER_RATING_DETAILS }];
        default:
            return [];
    }
}

export const useMockSubscription = <TArgs, TValue extends Value>(def: MockSubscribableDef, args: TArgs): SubscriptionState<TValue> => {
    const [state, setState] = useState<SubscriptionState<TValue>>({ status: "unacknowledged" });
    
    useEffect(() => {
        setTimeout(() => {
            setState({
                status: "ready",
                data: getMockData<TArgs, TValue>(def.subscription, args),
            });
        }, MOCK_WAIT_TIMES[def.subscription]);
    }, []);
    
    return state;
};

export const isReadyWithData = (sub: SubscriptionState<Value>): sub is ReadySubscription =>
    sub.status === "ready" && sub.data && sub.data.length > 0;