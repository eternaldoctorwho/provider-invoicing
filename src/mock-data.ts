import { USER_TYPES, ACTIVITY_TYPES } from './Enum';
import { LocalProtoDate, Timestamp } from '@dmg/core/src/protocolTypes';

export namespace MockTypes {
    export interface UserContext {
        userType: USER_TYPES,
        rating?: number,
    }
    
    export interface ProviderJob {
        id: string,
        purchaseOrderNumber?: string,
        propertyName: string,
        propertyTimeZone: string,
        invoiceDate: LocalProtoDate,
        scope?: string,
        serviceType: string,
        nte?: number,
        providerLaborLines?: LineItem[],
        materialLines?: MaterialLineItem[],
        tripChargeLines?: LineItem[],
        onSiteActivity?: OnSiteActivity[],
    }
    
    export interface LineItem {
        id: string,
        description: string,
        unitPrice: number,
        quantity: number,
    }

    export interface MaterialLineItem extends LineItem {
        type: 'materials' | 'equipment',
        equipmentType?: string,
    } 
    
    export interface OnSiteActivity {
        id: string,
        technicianName: string,
        checkInUtc: Timestamp,
        checkOutUtc: Timestamp,
        laborTypes: LaborType[],
    }

    export interface LaborType {
        id: string,
        start: Timestamp,
        end: Timestamp,
        type: ACTIVITY_TYPES,
    }
    
    export interface ProviderRating {
        categories: RatingCategory[],
    }

    export interface RatingCategory {
        type: "percentile" | "percentage",
        category: string,
        value: number,
        weightedScore: number,
        unit: "time" | "percent",
        icon: "A" | "B" | "C" | "D" | "F" | "ThumbsUp",
        details: JobDetails[]
    };

    export interface JobDetails {
        poNumber: string,
        workCompleteUtc?: Timestamp,
        invoiceSubmittedUtc?: Timestamp,
        bidAcceptedUtc?: Timestamp,
        firstCheckInUtc?: Timestamp
    }
}


export const MOCK_USER_CONTEXT = {
    userType: USER_TYPES.DIVISIONS,
    rating: 3.5,
};

export const MOCK_PROVIDER_RATING_DETAILS = 
{
    categories: [
        {
            type: "percentile",
            value: 17,
            weightedScore: 39,
            unit: "time",
            icon: "D",
            category: "Time to Invoice",
            differenceToNextGrade: 8,
            details: [
                {
                    poNumber: "PO4384843",
                    workCompleteUtc: "2019-08-12T15:20:00Z",
                    invoiceSubmittedUtc: "2019-08-14T16:40:00Z",
                },
                {
                    poNumber: "PO4384844",
                    workCompleteUtc: "2019-08-12T13:50:00Z",
                    invoiceSubmittedUtc: "2019-08-14T16:30:00Z",
                },
                {
                    poNumber: "PO4384845",
                    workCompleteUtc: "2019-08-12T14:40:00Z",
                    invoiceSubmittedUtc: "2019-08-14T16:40:00Z",
                },
                {
                    poNumber: "PO4384846",
                    workCompleteUtc: "2019-08-12T11:26:00Z",
                    invoiceSubmittedUtc: "2019-08-14T16:40:00Z",
                },
                {
                    poNumber: "PO4384847",
                    workCompleteUtc: "2019-08-12T10:20:00Z",
                    invoiceSubmittedUtc: "2019-08-14T16:44:00Z",
                },
            ]
        },
        {
            type: "percentile",
            value: 28,
            weightedScore: 18,
            unit: "time",
            icon: "C",
            category: "Time to Get On Site",
            differenceToNextGrade: 6,
            details: [
                {
                    poNumber: "PO4384843",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384844",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384845",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384846",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384847",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
            ]
        },
        {
            type: "percentile",
            value: 73,
            weightedScore: 49,
            unit: "time",
            icon: "B-",
            category: "Time to Complete",
            differenceToNextGrade: 2,
            details: [
                {
                    poNumber: "PO4384843",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    workCompleteUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384844",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    workCompleteUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384845",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    workCompleteUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384846",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    workCompleteUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384847",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    workCompleteUtc: "2019-08-14T16:44:00Z",
                },
            ]
        },
        {
            type: "percentile",
            value: 97,
            icon: "A",
            weightedScore: 99,
            unit: "percent",
            category: "Check in Usage",
            differenceToNextGrade: 0.3,
            details: [
                {
                    poNumber: "PO4384843",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384844",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384845",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384846",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
                {
                    poNumber: "PO4384847",
                    bidAcceptedUtc: "2019-08-12T10:20:00Z",
                    firstCheckInUtc: "2019-08-14T16:44:00Z",
                },
            ]
        }
    ]
};

export const MOCK_PROVIDER_JOB = {
    id: "12345",
    purchaseOrderNumber: "PO1514730",
    propertyName: "Big Lots: Us 70 W Suite 1 Marion 5278",
    propertyTimeZone: "America/New_York",
    invoiceDate: { year: 2019, month: 10, day: 9 },
    scope: "Glass is separated from frame with 1/4 inch gap.\nAlso looks as if some has attempted to remove the stripping.\n**Point of Contact: Josh 859-750-0977**\n**There is to be 1 TECHNICIAN sent on initial visits unless pre-authorization has been given**\n** You MUST Call if needing a onsite NTE increase**\n**Provider MUST use InPostion to Check IN and OUT **\n**Provider MUST obtain signed completion form with hours logged and materials used**\n**If submitting a quote, it is required to be back to Divisions within 2 Business days**\n**When Invoicing it must be returned ASAP so it does not cancel out of the system**",
    serviceType: "Handyman",
    nte: 200.00,
    providerLaborLines: [
        {
            id: '1',
            description: "Handyman Labor - Normal",
            unitPrice: 40.00,
            quantity: 3.05,
        },
        {
            id: '2',
            description: "Handyman Labor - Helper",
            unitPrice: 20.00,
            quantity: 1.08,
        },
        {
            id: '3',
            description: "Handyman Labor - Unapproved",
            unitPrice: 0.00,
            quantity: 0.17,
        },
    ],
    tripChargeLines: [
        {
            id: '90',
            description: 'Trip Charge 1',
            quantity: 1,
            unitPrice: 50.00,
        },
        {
            id: '91',
            description: 'Trip Charge 2',
            quantity: 1,
            unitPrice: 25.10,
        },
        {
            id: '92',
            description: 'Trip Charge 3',
            quantity: 1,
            unitPrice: 12.55,
        },
    ],
    onSiteActivity: [
        {
            id: "555555",
            technicianName: "Tech 1",
            checkInUtc: "2019-08-30T13:43:00Z",
            checkOutUtc: "2019-08-30T15:06:00Z",
            laborTypes: [
                {
                    id: "555555-1",
                    start: "2019-08-30T13:43:00Z",
                    end: "2019-08-30T15:06:00Z",
                    type: ACTIVITY_TYPES.REGULAR,
                },
            ],
        },
        {
            id: "666666",
            technicianName: "Tech 1",
            checkInUtc: "2019-08-30T15:20:00Z",
            checkOutUtc: "2019-08-30T15:33:00Z",
            laborTypes: [
                {
                    id: "666666-1",
                    start: "2019-08-30T15:20:00Z",
                    end: "2019-08-30T15:33:00Z",
                    type: ACTIVITY_TYPES.REGULAR,
                },
            ],
        },
        {
            id: "666667",
            technicianName: "Tech 1",
            checkInUtc: "2019-08-30T15:45:00Z",
            checkOutUtc: "2019-08-30T15:51:00Z",
            laborTypes: [
                {
                    id: "666667-1",
                    start: "2019-08-30T15:45:00Z",
                    end: "2019-08-30T15:51:00Z",
                    type: ACTIVITY_TYPES.REGULAR,
                },
            ],
        },
        {
            id: "777777",
            technicianName: "Tech 2",
            checkInUtc: "2019-08-30T14:01:00Z",
            checkOutUtc: "2019-08-30T15:22:00Z",
            laborTypes: [
                {
                    id: "777777-1",
                    start: "2019-08-30T14:01:00Z",
                    end: "2019-08-30T15:06:00Z",
                    type: ACTIVITY_TYPES.HELPER,
                },
                {
                    id: "777777-2",
                    start: "2019-08-30T15:06:00Z",
                    end: "2019-08-30T15:20:00Z",
                    type: ACTIVITY_TYPES.REGULAR,
                },
                {
                    id: "777777-3",
                    start: "2019-08-30T15:20:00Z",
                    end: "2019-08-30T15:22:00Z",
                    type: ACTIVITY_TYPES.HELPER,
                }
            ],
        },
        {
            id: "888888",
            technicianName: "Tech 2",
            checkInUtc: "2019-08-30T17:33:00Z",
            checkOutUtc: "2019-08-30T18:53:00Z",
            laborTypes: [
                {
                    id: "888888-1",
                    start: "2019-08-30T17:33:00Z",
                    end: "2019-08-30T18:53:00Z",
                    type: ACTIVITY_TYPES.REGULAR,
                }
            ],
        },
        {
            id: "99999",
            technicianName: "Tech 3",
            checkInUtc: "2019-08-30T14:05:00Z",
            checkOutUtc: "2019-08-30T14:15:00Z",
            laborTypes: [
                {
                    id: "999999-1",
                    start: "2019-08-30T14:05:00Z",
                    end: "2019-08-30T14:15:00Z",
                    type: ACTIVITY_TYPES.UNAPPROVED,
                }
            ],
        },
        {
            id: "111111",
            technicianName: "Tech 2",
            checkInUtc: "2019-09-02T01:40:00Z",
            checkOutUtc: "2019-09-02T02:00:30Z",
            laborTypes: [
                {
                    id: "111111-1",
                    start: "2019-09-02T01:40:00Z",
                    end: "2019-09-02T02:00:30Z",
                    type: ACTIVITY_TYPES.REGULAR,
                }
            ],
        },
        {
            id: "222222",
            technicianName: "Tech 2",
            checkInUtc: "2020-03-08T05:05:00Z",
            checkOutUtc: "2020-03-08T08:05:00Z",
            laborTypes: [
                {
                    id: "222222-1",
                    start: "2020-03-08T05:05:00Z",
                    end: "2020-03-08T08:05:30Z",
                    type: ACTIVITY_TYPES.REGULAR,
                }
            ],
        },
    ],
};

