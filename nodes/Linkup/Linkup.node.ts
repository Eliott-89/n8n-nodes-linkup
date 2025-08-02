import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

// Centralisation des constantes
const LINKUP_API_BASE_URL = 'https://api.linkupapi.com/v1';
const NODE_VERSION = '1.2.41';

// Types pour une meilleure organisation
interface LinkupCredentials {
    apiKey: string;
    email?: string;
    password?: string;
    country?: string;
    loginToken?: string;
}

interface RequestBody {
    [key: string]: any;
}

export class Linkup implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Linkup API for LinkedIn',
        name: 'linkup',
        icon: 'file:linkup.svg',
        group: ['transform'],
        version: 1,
        description: 'Automate LinkedIn with Linkup',
        defaults: {
            name: 'LINKUP',
            color: '#0077b5',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'linkupApi',
                required: true,
            },
        ],
        properties: [
            // === INFORMATION PANEL ===
            {
                displayName: `Welcome to <b>Linkup API</b> for LinkedIn automation! 🚀<br/><br/>
                If you don't have an account yet, <a href="https://linkupapi.com" target="_blank">visit this page</a> to create your account and get your API key.<br/><br/>
                This powerful API allows you to automate all your LinkedIn activities including profile management, networking, messaging, and content creation.`,
                name: 'notice',
                type: 'notice' as any,
                default: '',
                displayOptions: {
                    show: {
                        operation: ['login'],
                    },
                },
            },
            
            // === OPERATION SELECTOR ===
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Authentication',
                        value: 'authentication',
                    },
                    {
                        name: 'Profile',
                        value: 'profile',
                    },
                    {
                        name: 'Company',
                        value: 'company',
                    },
                    {
                        name: 'Network',
                        value: 'network',
                    },
                    {
                        name: 'Message',
                        value: 'message',
                    },
                    {
                        name: 'Post',
                        value: 'post',
                    },
                    {
                        name: 'Recruiter',
                        value: 'recruiter',
                    },
                    {
                        name: 'Data',
                        value: 'data',
                    },
                ],
                default: 'authentication',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['authentication'],
                    },
                },
                options: [
                    { name: 'Login', value: 'login', description: 'Authenticate your LinkedIn account via Linkup - [Get API key at LinkupAPI.com](https://linkupapi.com)' },
                    { name: 'Verify Code', value: 'verifyCode', description: 'Validate the security code received by email' },
                ],
                default: 'login',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['profile'],
                    },
                },
                options: [
                    { name: 'Get My Profile', value: 'getMyProfile', description: 'Get your LinkedIn profile information' },
                    { name: 'Extract Profile Information', value: 'extractProfileInfo', description: 'Extract information from a public LinkedIn profile' },
                    { name: 'Search Profile', value: 'searchProfile', description: 'Search LinkedIn profiles' },
                ],
                default: 'getMyProfile',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['company'],
                    },
                },
                options: [
                    { name: 'Search Companies', value: 'searchCompanies', description: 'Search LinkedIn companies' },
                    { name: 'Get Company Information', value: 'getCompanyInfo', description: 'Get LinkedIn company information' },
                ],
                default: 'searchCompanies',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['network'],
                    },
                },
                options: [
                    { name: 'Send Connection Request', value: 'sendConnectionRequest', description: 'Send a LinkedIn invitation' },
                    { name: 'Get Connections', value: 'getConnections', description: 'Get your LinkedIn connections list' },
                    { name: 'Accept Connection Invitation', value: 'acceptConnectionInvitation', description: 'Accept a received LinkedIn invitation' },
                    { name: 'Get Received Invitations', value: 'getReceivedInvitations', description: 'List received LinkedIn invitations' },
                    { name: 'Get Sent Invitations', value: 'getSentInvitations', description: 'List sent LinkedIn invitations' },
                    { name: 'Withdraw Invitation', value: 'withdrawInvitation', description: 'Cancel a sent LinkedIn invitation' },
                    { name: 'Get Network Recommendations', value: 'getNetworkRecommendations', description: 'Get profile recommendations to add' },
                    { name: 'Get Invitation Status', value: 'getInvitationStatus', description: 'Check LinkedIn invitation status' },
                ],
                default: 'sendConnectionRequest',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['message'],
                    },
                },
                options: [
                    { name: 'Send Message', value: 'sendMessage', description: 'Send a LinkedIn message' },
                    { name: 'Get Message Inbox', value: 'getMessageInbox', description: 'Get LinkedIn conversations list' },
                    { name: 'Get Conversation Messages', value: 'getConversationMessages', description: 'Get LinkedIn conversation history' },
                ],
                default: 'sendMessage',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['post'],
                    },
                },
                options: [
                    { name: 'Get Post Reactions', value: 'getPostReactions', description: 'Get post reactions' },
                    { name: 'React to Post', value: 'reactToPost', description: 'React to a post' },
                    { name: 'Repost Content', value: 'repost', description: 'Repost a post' },
                    { name: 'Add Comment to Post', value: 'commentPost', description: 'Comment on a post' },
                    { name: 'Get Comments', value: 'extractComments', description: 'Extract post comments' },
                    { name: 'Answer Comment', value: 'answerComment', description: 'Reply to a comment' },
                    { name: 'Search Posts', value: 'searchPosts', description: 'Search posts' },
                    { name: 'Create Post', value: 'createPost', description: 'Create a post' },
                    { name: 'Get LinkedIn Feed', value: 'getFeed', description: 'Get feed' },
                    { name: 'Send Post Time Spent Signal', value: 'timeSpent', description: 'Record time spent on a post' },
                ],
                default: 'getPostReactions',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['recruiter'],
                    },
                },
                options: [
                    { name: 'Get Candidates', value: 'getCandidates', description: 'List candidates from a LinkedIn Recruiter job posting' },
                    { name: 'Get Candidate CV', value: 'getCandidateCV', description: 'Download a LinkedIn Recruiter candidate CV' },
                    { name: 'Get Job Posts', value: 'getJobPosts', description: 'List LinkedIn Recruiter job postings' },
                    { name: 'Publish Job', value: 'publishJob', description: 'Publish a LinkedIn Recruiter job posting' },
                    { name: 'Close Job', value: 'closeJob', description: 'Close a LinkedIn Recruiter job posting' },
                    { name: 'Create Job', value: 'createJob', description: 'Create a new LinkedIn Recruiter job posting' },
                ],
                default: 'getCandidates',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['data'],
                    },
                },
                options: [
                    { name: 'Search Companies', value: 'searchCompaniesData', description: 'Advanced company search (Data/Enrichment)' },
                    { name: 'Search Profiles', value: 'searchProfilesData', description: 'Advanced profile search (Data/Enrichment)' },
                ],
                default: 'searchCompaniesData',
            },

            // === PARAMÈTRES SPÉCIFIQUES PAR OPÉRATION ===
            
            // AUTH - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'authParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['verifyCode'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Verification Code *',
                        name: 'verificationCode',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Security code received by email',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // PROFILE - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'profileParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['extractProfileInfo', 'getInvitationStatus'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'LinkedIn Profile URL *',
                        name: 'profileUrl',
                        type: 'string',
                        default: '',
                        required: true,
                        placeholder: 'https://www.linkedin.com/in/username',
                        description: 'LinkedIn profile URL',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // COMPANIES - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'companiesParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getCompanyInfo'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'LinkedIn Company URL *',
                        name: 'companyUrl',
                        type: 'string',
                        default: '',
                        required: true,
                        placeholder: 'https://www.linkedin.com/company/stripe/',
                        description: 'LinkedIn company URL',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // NETWORK - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'networkParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['sendConnectionRequest'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'LinkedIn Profile URL *',
                        name: 'profileUrl',
                        type: 'string',
                        default: '',
                        required: true,
                        placeholder: 'https://www.linkedin.com/in/username',
                        description: 'LinkedIn profile URL',
                    },
                    {
                        displayName: 'Connection Message',
                        name: 'connectionMessage',
                        type: 'string',
                        default: '',
                        description: 'Personalized message for invitation',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // ACCEPT CONNECTION - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'acceptConnectionParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['acceptConnectionInvitation'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Shared Secret',
                        name: 'sharedSecret',
                        type: 'string',
                        default: '',
                        description: 'Invitation shared secret',
                    },
                    {
                        displayName: 'Entity URN *',
                        name: 'entityUrn',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Invitation URN',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // WITHDRAW INVITATION - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'withdrawInvitationParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['withdrawInvitation'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Invitation ID *',
                        name: 'invitationId',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Invitation ID to withdraw',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // GET INVITATION STATUS - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'getInvitationStatusParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getInvitationStatus'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'LinkedIn Profile URL *',
                        name: 'profileUrl',
                        type: 'string',
                        default: '',
                        required: true,
                        placeholder: 'https://www.linkedin.com/in/username',
                        description: 'LinkedIn profile URL',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // MESSAGES - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'messagesParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['sendMessage'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'LinkedIn URL *',
                        name: 'messageRecipientUrl',
                        type: 'string',
                        default: '',
                        required: true,
                        placeholder: 'https://www.linkedin.com/in/username',
                        description: 'LinkedIn profile URL of the recipient',
                    },
                    {
                        displayName: 'Message Text *',
                        name: 'messageText',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Message content to send',
                    },
                    {
                        displayName: 'Media Link',
                        name: 'mediaLink',
                        type: 'string',
                        default: '',
                        description: 'Direct URL of media to attach',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // CONVERSATION MESSAGES - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'conversationMessagesParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getConversationMessages'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'LinkedIn URL *',
                        name: 'linkedinUrl',
                        type: 'string',
                        default: '',
                        required: true,
                        placeholder: 'https://www.linkedin.com/in/username',
                        description: 'LinkedIn profile URL',
                    },
                    {
                        displayName: 'Conversation ID *',
                        name: 'conversationId',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Unique LinkedIn conversation identifier',
                    },
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of messages to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // POSTS - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'postsParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getPostReactions', 'reactToPost', 'repost', 'commentPost', 'extractComments', 'timeSpent'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'LinkedIn Post URL *',
                        name: 'postUrl',
                        type: 'string',
                        default: '',
                        required: true,
                        placeholder: 'https://www.linkedin.com/feed/update/xxx',
                        description: 'URL of the LinkedIn post to send time spent signal for',
                    },
                    {
                        displayName: 'Reaction Type *',
                        name: 'reactionType',
                        type: 'options',
                        displayOptions: {
                            show: {
                                operation: ['reactToPost'],
                            },
                        },
                        options: [
                            { name: '👍 Like', value: 'LIKE' },
                            { name: '👏 Praise', value: 'PRAISE' },
                            { name: '🙏 Appreciation', value: 'APPRECIATION' },
                            { name: '🤗 Empathy', value: 'EMPATHY' },
                            { name: '🎯 Interest', value: 'INTEREST' },
                            { name: '🎭 Entertainment', value: 'ENTERTAINMENT' },
                        ],
                        default: 'LIKE',
                        required: true,
                        description: 'Type of reaction to add. Available options: LIKE, PRAISE, APPRECIATION, EMPATHY, INTEREST, ENTERTAINMENT',
                    },
                    {
                        displayName: 'Message/Text *',
                        name: 'messageText',
                        type: 'string',
                        default: '',
                        required: true,
                        displayOptions: {
                            show: {
                                operation: ['commentPost'],
                            },
                        },
                        description: 'Text content of the comment to post',
                    },
                    {
                        displayName: 'Duration (milliseconds) *',
                        name: 'duration',
                        type: 'number',
                        default: 30000,
                        required: true,
                        displayOptions: {
                            show: {
                                operation: ['timeSpent'],
                            },
                        },
                        description: 'Duration in milliseconds that the user spent viewing the post. Must be a positive integer.',
                        typeOptions: {
                            minValue: 1,
                        },
                    },
                    {
                        displayName: 'Start Time (milliseconds)',
                        name: 'durationStartTime',
                        type: 'number',
                        default: '',
                        displayOptions: {
                            show: {
                                operation: ['timeSpent'],
                            },
                        },
                        description: 'Optional start time in milliseconds when the user began viewing the post',
                    },
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // ANSWER COMMENT - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'answerCommentParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['answerComment'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Tracking ID *',
                        name: 'trackingId',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Unique identifier for tracking the request',
                    },
                    {
                        displayName: 'Profile URN *',
                        name: 'profileUrn',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'LinkedIn profile URN of the user posting the comment',
                    },
                    {
                        displayName: 'Comment URN *',
                        name: 'commentUrn',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'LinkedIn comment URN to reply to',
                    },
                    {
                        displayName: 'Comment Text *',
                        name: 'commentText',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Text content of the reply to post',
                    },
                    {
                        displayName: 'Mention User',
                        name: 'mentionUser',
                        type: 'boolean',
                        default: false,
                        description: 'Whether to mention the original commenter in the reply',
                    },
                    {
                        displayName: 'Commenter Name',
                        name: 'commenterName',
                        type: 'string',
                        default: '',
                        description: 'Original commenter name',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // CREATE POST - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'createPostParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['createPost'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Message/Text *',
                        name: 'messageText',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Text content of the post',
                    },
                    {
                        displayName: 'File',
                        name: 'file',
                        type: 'string',
                        default: '',
                        description: 'Optional image file URL. Direct link to the image file you want to attach to the post',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // SEARCH PROFILE - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'searchProfileParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['searchProfile'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Keyword',
                        name: 'keyword',
                        type: 'string',
                        default: '',
                        description: 'Search keyword',
                    },
                    {
                        displayName: 'Location(s)',
                        name: 'location',
                        type: 'string',
                        default: '',
                        description: 'Geographic location(s) (separated by ;)',
                    },
                    {
                        displayName: 'Company(ies)',
                        name: 'company_url',
                        type: 'string',
                        default: '',
                        description: 'LinkedIn company URL(s) (separated by ;)',
                    },
                    {
                        displayName: 'School(s)',
                        name: 'school_url',
                        type: 'string',
                        default: '',
                        description: 'LinkedIn school URL(s) (separated by ;)',
                    },
                    {
                        displayName: 'Network',
                        name: 'network',
                        type: 'string',
                        default: '',
                        description: 'Connection level (F=1st, S=2nd, O=outside network)',
                    },
                    {
                        displayName: 'First Name',
                        name: 'first_name',
                        type: 'string',
                        default: '',
                        description: 'Filter by first name',
                    },
                    {
                        displayName: 'Last Name',
                        name: 'last_name',
                        type: 'string',
                        default: '',
                        description: 'Filter by last name',
                    },
                    {
                        displayName: 'Title/Position',
                        name: 'title',
                        type: 'string',
                        default: '',
                        description: 'Filter by title/position',
                    },
                    {
                        displayName: 'Show Invitation Status',
                        name: 'fetch_invitation_state',
                        type: 'boolean',
                        default: true,
                        description: 'Include invitation status for each profile',
                    },
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // SEARCH COMPANIES - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'searchCompaniesParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['searchCompanies'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Keyword',
                        name: 'keyword',
                        type: 'string',
                        default: '',
                        description: 'Search keyword',
                    },
                    {
                        displayName: 'Location(s)',
                        name: 'location',
                        type: 'string',
                        default: '',
                        description: 'Geographic location(s) (separated by ;)',
                    },
                    {
                        displayName: 'Sector(s)',
                        name: 'sector',
                        type: 'string',
                        default: '',
                        description: 'Business sector(s) (separated by ;)',
                    },
                    {
                        displayName: 'Company Size',
                        name: 'company_size',
                        type: 'string',
                        default: '',
                        description: 'Company size range',
                    },
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // SEARCH POSTS - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'searchPostsParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['searchPosts'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Keyword',
                        name: 'keyword',
                        type: 'string',
                        default: '',
                        description: 'Search keyword',
                    },
                    {
                        displayName: 'Post Type',
                        name: 'post_type',
                        type: 'string',
                        default: '',
                        description: 'Type of post to search',
                    },
                    {
                        displayName: 'Sort By',
                        name: 'sort_by',
                        type: 'string',
                        default: '',
                        description: 'Post sorting criteria',
                    },
                    {
                        displayName: 'Post Date',
                        name: 'post_date',
                        type: 'string',
                        default: '',
                        description: 'Post date to filter',
                    },
                    {
                        displayName: 'LinkedIn URL (search)',
                        name: 'linkedin_url',
                        type: 'string',
                        default: '',
                        description: 'LinkedIn URL for search',
                    },
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // GET CONNECTIONS - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'getConnectionsParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getConnections'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // GET INVITATIONS - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'getInvitationsParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getReceivedInvitations', 'getSentInvitations'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Invitation Type',
                        name: 'invitation_type',
                        type: 'string',
                        default: '',
                        description: 'Invitation type (CONNECTION, ORGANIZATION, etc.)',
                    },
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // NETWORK RECOMMENDATIONS - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'getNetworkRecommendationsParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getNetworkRecommendations'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // MESSAGE INBOX - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'getMessageInboxParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getMessageInbox'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Category',
                        name: 'category',
                        type: 'string',
                        default: 'INBOX',
                        placeholder: 'INBOX, INMAIL, JOB, UNREAD',
                        description: 'Category to filter by. Available: (INBOX, INMAIL, JOB, UNREAD)',
                    },
                    {
                        displayName: 'Next Cursor',
                        name: 'next_cursor',
                        type: 'string',
                        default: '',
                        description: 'Cursor for pagination (optional - used to get the next batch of results)',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // GET FEED - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'getFeedParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getFeed'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of feed posts to retrieve (the API will automatically handle pagination)',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // RECRUITER - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'recruiterParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getCandidates', 'getJobPosts'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Job ID *',
                        name: 'jobId',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Unique job identifier for candidates',
                    },
                    {
                        displayName: 'Location',
                        name: 'location',
                        type: 'string',
                        default: '',
                        description: 'Job location filter',
                    },
                    {
                        displayName: 'Fetch Details',
                        name: 'fetchDetails',
                        type: 'boolean',
                        default: true,
                        description: 'Fetch detailed information for job posts',
                    },
                    {
                        displayName: 'Years of Experience',
                        name: 'yearsOfExperience',
                        type: 'string',
                        default: '',
                        description: 'Required years of experience (Recruiter)',
                    },
                    {
                        displayName: 'Sort Type',
                        name: 'sortType',
                        type: 'string',
                        default: '',
                        description: 'Sort type for candidates (Recruiter)',
                    },
                    {
                        displayName: 'Sort Order',
                        name: 'sortOrder',
                        type: 'string',
                        default: '',
                        description: 'Sort order (ASC/DESC) (Recruiter)',
                    },
                    {
                        displayName: 'Ratings',
                        name: 'ratings',
                        type: 'string',
                        default: '',
                        description: 'Filter by ratings (Recruiter)',
                    },
                    {
                        displayName: 'Start',
                        name: 'start',
                        type: 'string',
                        default: '',
                        description: 'Starting point for pagination (Recruiter)',
                    },
                    {
                        displayName: 'Number of Results',
                        name: 'total_results',
                        type: 'number',
                        default: 10,
                        description: 'Number of results to retrieve',
                    },
                    {
                        displayName: 'Start Page',
                        name: 'start_page',
                        type: 'number',
                        default: 1,
                        description: 'First page to retrieve',
                    },
                    {
                        displayName: 'End Page',
                        name: 'end_page',
                        type: 'number',
                        default: 1,
                        description: 'Last page to retrieve',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // PUBLISH/CLOSE JOB - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'publishCloseJobParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['publishJob', 'closeJob'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Job ID *',
                        name: 'jobId',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Unique job identifier to publish/close',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // CREATE JOB - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'createJobParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['createJob'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Company URL *',
                        name: 'companyUrl',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'URL of the LinkedIn company page (e.g., "https://www.linkedin.com/company/company-name/")',
                    },
                    {
                        displayName: 'Job Title *',
                        name: 'jobTitle',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Job title (e.g., "Senior Software Engineer")',
                    },
                    {
                        displayName: 'Job Location *',
                        name: 'place',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Job location (e.g., "Paris, France")',
                    },
                    {
                        displayName: 'HTML Description *',
                        name: 'html_description',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'Job description in HTML format. Supports basic HTML formatting (bold, lists, paragraphs)',
                    },
                    {
                        displayName: 'Employment Status',
                        name: 'employment_status',
                        type: 'string',
                        default: '',
                        description: 'Employment status (CDD, CDI, etc.) (createJob)',
                    },
                    {
                        displayName: 'Workplace',
                        name: 'workplace',
                        type: 'string',
                        default: '',
                        description: 'Workplace type (Office, Remote, etc.) (createJob)',
                    },
                    {
                        displayName: 'Skills (JSON)',
                        name: 'skills',
                        type: 'string',
                        default: '',
                        description: 'Required skills in JSON array format (createJob)',
                    },
                    {
                        displayName: 'Screening Questions (JSON)',
                        name: 'screening_questions',
                        type: 'string',
                        default: '',
                        description: 'Screening questions in JSON array format (createJob)',
                    },
                    {
                        displayName: 'Auto Rejection Template',
                        name: 'auto_rejection_template',
                        type: 'string',
                        default: '',
                        description: 'Auto rejection template (createJob)',
                    },
                    {
                        displayName: 'Contact Email',
                        name: 'contact_email',
                        type: 'string',
                        default: '',
                        description: 'Contact email for job (createJob)',
                    },                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // GET CANDIDATE CV - Paramètres Linkup
            {
                displayName: 'Linkup Parameters',
                name: 'getCandidateCVParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['getCandidateCV'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Application ID *',
                        name: 'applicationId',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'LinkedIn application ID of the candidate (you can get it with the /recruiter/candidates endpoint)',
                    },
                    {
                        displayName: 'Country Code',
                        name: 'country',
                        type: 'string',
                        default: 'FR',
                        placeholder: 'FR, US, UK, DE, ES, IT, CA, AU, etc.',
                        description: 'Country code for proxy selection (e.g., FR for France, US for United States)',
                    },
                ],
            },

            // === DATA NODES PARAMETERS ===
            
            // DATA COMPANIES - Paramètres Linkup
            {
                displayName: 'Data Companies Parameters',
                name: 'dataCompaniesParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['searchCompaniesData'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Keyword',
                        name: 'keyword',
                        type: 'string',
                        default: '',
                        description: 'Search keyword for companies',
                    },
                    {
                        displayName: 'Industry',
                        name: 'industry',
                        type: 'string',
                        default: '',
                        description: 'Company business sector',
                    },
                    {
                        displayName: 'Location',
                        name: 'location',
                        type: 'string',
                        default: '',
                        description: 'Company geographic location',
                    },
                    {
                        displayName: 'Employee Range',
                        name: 'employee_range',
                        type: 'string',
                        default: '',
                        description: 'Employee range (e.g., 1-10, 11-50, 51-200, 201-500, 501-1000, 1001+)',
                    },
                    {
                        displayName: 'Founding Company',
                        name: 'founding_company',
                        type: 'boolean',
                        default: false,
                        description: 'Filter only founding companies',
                    },
                    {
                        displayName: 'Total Results',
                        name: 'total_results',
                        type: 'number',
                        default: 100,
                        description: 'Maximum number of results to return',
                    },
                ],
            },

            // DATA PROFILES - Paramètres Linkup
            {
                displayName: 'Data Profiles Parameters',
                name: 'dataProfilesParams',
                type: 'collection',
                placeholder: 'Add a parameter',
                displayOptions: {
                    show: {
                        operation: ['searchProfilesData'],
                    },
                },
                default: {},
                options: [
                    {
                        displayName: 'Keyword',
                        name: 'keyword',
                        type: 'string',
                        default: '',
                        description: 'Search keyword for profiles',
                    },
                    {
                        displayName: 'Job Title',
                        name: 'job_title',
                        type: 'string',
                        default: '',
                        description: 'Current or desired job title',
                    },
                    {
                        displayName: 'Industry',
                        name: 'industry',
                        type: 'string',
                        default: '',
                        description: 'Profile business sector',
                    },
                    {
                        displayName: 'School/University',
                        name: 'school',
                        type: 'string',
                        default: '',
                        description: 'School or university attended',
                    },
                    {
                        displayName: 'Location',
                        name: 'location',
                        type: 'string',
                        default: '',
                        description: 'Profile geographic location',
                    },
                    {
                        displayName: 'Current Company',
                        name: 'current_company',
                        type: 'string',
                        default: '',
                        description: 'Company where profile currently works',
                    },
                    {
                        displayName: 'Total Results',
                        name: 'total_results',
                        type: 'number',
                        default: 100,
                        description: 'Maximum number of results to return',
                    },
                ],
            },

            // === GLOBAL OPTIONS ===
            {
                displayName: 'Advanced Options',
                name: 'additionalFields',
                type: 'collection',
                placeholder: 'Add an option',
                default: {},
                options: [
                    {
                        displayName: 'Timeout',
                        name: 'timeout',
                        type: 'number',
                        default: 30000,
                        description: 'Request timeout in milliseconds',
                    },
                    {
                        displayName: 'Retry Count',
                        name: 'retryCount',
                        type: 'number',
                        default: 3,
                        description: 'Number of retries on failure',
                    },
                ],
            },
        ],
    };

    // === UTILITY METHODS ===
    static sanitizeCredentialValue(value: string): string | null {
        if (!value || value.includes('__n8n_BLANK_VALUE_')) {
            return null;
        }
        return value;
    }

    private async getCredentialsWithFallback(
        context: IExecuteFunctions,
        _itemIndex: number
    ): Promise<LinkupCredentials> {
        // Toujours utiliser les credentials sauvegardées (plus de custom credentials)
        const credentials = await context.getCredentials('linkupApi');
        
        if (!credentials) {
            throw new Error('Clé API manquante. Veuillez configurer vos credentials LINKUP dans les paramètres du nœud.');
        }
        
        const apiKey = Linkup.sanitizeCredentialValue(credentials.apiKey as string);
        const email = Linkup.sanitizeCredentialValue(credentials.linkedinEmail as string);
        const password = Linkup.sanitizeCredentialValue(credentials.linkedinPassword as string);
        const country = Linkup.sanitizeCredentialValue(credentials.country as string);
        const loginToken = Linkup.sanitizeCredentialValue(credentials.loginToken as string);

        if (!apiKey) {
            throw new Error('Clé API manquante. Veuillez configurer vos credentials LINKUP dans les paramètres du nœud.');
        }

        return { 
            apiKey: apiKey!, 
            email: email || '', 
            password: password || '', 
            country: country || 'FR',
            loginToken: loginToken || ''
        };
    }

    private buildRequestOptions(
        endpoint: string,
        method: 'POST' | 'GET',
        apiKey: string,
        body: RequestBody,
        timeout: number
    ): any {
        return {
            method,
            url: `${LINKUP_API_BASE_URL}${endpoint}`,
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'n8n-linkup-node/1.2.0',
            },
            body,
            timeout,
        };
    }

    private async buildRequestBody(
        context: IExecuteFunctions,
        itemIndex: number,
        operation: string,
        loginToken?: string
    ): Promise<RequestBody> {
        const body: RequestBody = {};

        // Ajouter le login token si nécessaire (depuis les credentials)
        if (loginToken && !['login', 'verifyCode', 'searchCompaniesData', 'searchProfilesData'].includes(operation)) {
            body.login_token = loginToken;
        }

        // Champs spécifiques par opération
        switch (operation) {
            case 'login':
                const creds = await context.getCredentials('linkupApi');
                if (creds) {
                    body.email = creds.linkedinEmail;
                    body.password = creds.linkedinPassword;
                    body.country = creds.country || 'FR'; // Utilise le country des credentials ou FR par défaut
                }
                break;

            case 'verifyCode':
                const credsVerify = await context.getCredentials('linkupApi');
                if (credsVerify) {
                    body.email = credsVerify.linkedinEmail;
                    const authParams = context.getNodeParameter('authParams', itemIndex, {}) as any;
                    if (authParams.verificationCode) body.code = authParams.verificationCode;
                    if (authParams.country) body.country = authParams.country;
                }
                break;

            case 'extractProfileInfo':
            case 'getInvitationStatus':
                const profileParams = context.getNodeParameter('profileParams', itemIndex, {}) as any;
                if (profileParams.profileUrl) body.linkedin_url = profileParams.profileUrl;
                if (profileParams.country) body.country = profileParams.country;
                break;

            case 'sendConnectionRequest':
                const networkParams = context.getNodeParameter('networkParams', itemIndex, {}) as any;
                if (networkParams.profileUrl) body.linkedin_url = networkParams.profileUrl;
                if (networkParams.connectionMessage) body.message = networkParams.connectionMessage;
                if (networkParams.country) body.country = networkParams.country;
                break;

            case 'getCompanyInfo':
                const companiesParams = context.getNodeParameter('companiesParams', itemIndex, {}) as any;
                if (companiesParams.companyUrl) body.company_url = companiesParams.companyUrl;
                if (companiesParams.country) body.country = companiesParams.country;
                break;

            case 'acceptConnectionInvitation':
                const acceptConnectionParams = context.getNodeParameter('acceptConnectionParams', itemIndex, {}) as any;
                if (acceptConnectionParams.sharedSecret) body.shared_secret = acceptConnectionParams.sharedSecret;
                if (acceptConnectionParams.entityUrn) body.entity_urn = acceptConnectionParams.entityUrn;
                if (acceptConnectionParams.country) body.country = acceptConnectionParams.country;
                break;

            case 'withdrawInvitation':
                const withdrawInvitationParams = context.getNodeParameter('withdrawInvitationParams', itemIndex, {}) as any;
                if (withdrawInvitationParams.invitationId) body.invitation_id = withdrawInvitationParams.invitationId;
                if (withdrawInvitationParams.country) body.country = withdrawInvitationParams.country;
                break;

            case 'sendMessage':
                const messagesParams = context.getNodeParameter('messagesParams', itemIndex, {}) as any;
                if (messagesParams.messageRecipientUrl) body.linkedin_url = messagesParams.messageRecipientUrl;
                if (messagesParams.messageText) body.message_text = messagesParams.messageText;
                if (messagesParams.mediaLink) body.media_link = messagesParams.mediaLink;
                if (messagesParams.country) body.country = messagesParams.country;
                break;

            case 'getConversationMessages':
                const conversationMessagesParams = context.getNodeParameter('conversationMessagesParams', itemIndex, {}) as any;
                if (conversationMessagesParams.linkedinUrl) body.linkedin_url = conversationMessagesParams.linkedinUrl;
                if (conversationMessagesParams.conversationId) body.conversation_id = conversationMessagesParams.conversationId;
                if (conversationMessagesParams.total_results) body.total_results = conversationMessagesParams.total_results;
                if (conversationMessagesParams.start_page) body.start_page = conversationMessagesParams.start_page;
                if (conversationMessagesParams.end_page) body.end_page = conversationMessagesParams.end_page;
                if (conversationMessagesParams.country) body.country = conversationMessagesParams.country;
                break;

            case 'getPostReactions':
            case 'repost':
            case 'extractComments':
            case 'reactToPost':
            case 'commentPost':
            case 'timeSpent':
                const postsParams = context.getNodeParameter('postsParams', itemIndex, {}) as any;
                if (postsParams.postUrl) body.post_url = postsParams.postUrl;
                if (postsParams.country) body.country = postsParams.country;
                
                // Paramètres spécifiques par opération
                if (operation === 'reactToPost' && postsParams.reactionType) {
                    body.reaction_type = postsParams.reactionType;
                }
                if (operation === 'commentPost' && postsParams.messageText) {
                    body.message = postsParams.messageText;
                }
                if (operation === 'timeSpent') {
                    if (postsParams.duration) body.duration = Math.floor(postsParams.duration);
                    if (postsParams.durationStartTime) body.duration_start_time = Math.floor(postsParams.durationStartTime);
                }
                if (operation === 'getPostReactions' || operation === 'extractComments') {
                    if (postsParams.total_results) body.total_results = postsParams.total_results;
                    if (postsParams.start_page) body.start_page = postsParams.start_page;
                    if (postsParams.end_page) body.end_page = postsParams.end_page;
                }
                break;

            case 'answerComment':
                const answerCommentParams = context.getNodeParameter('answerCommentParams', itemIndex, {}) as any;
                if (answerCommentParams.trackingId) body.tracking_id = answerCommentParams.trackingId;
                if (answerCommentParams.profileUrn) body.profile_urn = answerCommentParams.profileUrn;
                if (answerCommentParams.commentUrn) body.comment_urn = answerCommentParams.commentUrn;
                if (answerCommentParams.commentText) body.comment_text = answerCommentParams.commentText;
                if (answerCommentParams.mentionUser !== undefined) body.mention_user = answerCommentParams.mentionUser;
                if (answerCommentParams.commenterName) body.commenter_name = answerCommentParams.commenterName;
                if (answerCommentParams.country) body.country = answerCommentParams.country;
                break;

            case 'createPost':
                const createPostParams = context.getNodeParameter('createPostParams', itemIndex, {}) as any;
                if (createPostParams.messageText) body.message = createPostParams.messageText;
                if (createPostParams.file) body.file = createPostParams.file;
                if (createPostParams.country) body.country = createPostParams.country;
                break;

            case 'searchProfile':
                const searchProfileParams = context.getNodeParameter('searchProfileParams', itemIndex, {}) as any;
                if (searchProfileParams.keyword) body.keyword = searchProfileParams.keyword;
                if (searchProfileParams.location) body.location = searchProfileParams.location;
                if (searchProfileParams.company_url) body.company_url = searchProfileParams.company_url;
                if (searchProfileParams.school_url) body.school_url = searchProfileParams.school_url;
                if (searchProfileParams.network) body.network = searchProfileParams.network;
                if (searchProfileParams.first_name) body.first_name = searchProfileParams.first_name;
                if (searchProfileParams.last_name) body.last_name = searchProfileParams.last_name;
                if (searchProfileParams.title) body.title = searchProfileParams.title;
                if (searchProfileParams.fetch_invitation_state !== undefined) body.fetch_invitation_state = searchProfileParams.fetch_invitation_state;
                if (searchProfileParams.total_results) body.total_results = searchProfileParams.total_results;
                if (searchProfileParams.start_page) body.start_page = searchProfileParams.start_page;
                if (searchProfileParams.end_page) body.end_page = searchProfileParams.end_page;
                if (searchProfileParams.country) body.country = searchProfileParams.country;
                break;

            case 'searchCompanies':
                const searchCompaniesParams = context.getNodeParameter('searchCompaniesParams', itemIndex, {}) as any;
                if (searchCompaniesParams.keyword) body.keyword = searchCompaniesParams.keyword;
                if (searchCompaniesParams.location) body.location = searchCompaniesParams.location;
                if (searchCompaniesParams.sector) body.sector = searchCompaniesParams.sector;
                if (searchCompaniesParams.company_size) body.company_size = searchCompaniesParams.company_size;
                if (searchCompaniesParams.total_results) body.total_results = searchCompaniesParams.total_results;
                if (searchCompaniesParams.start_page) body.start_page = searchCompaniesParams.start_page;
                if (searchCompaniesParams.end_page) body.end_page = searchCompaniesParams.end_page;
                if (searchCompaniesParams.country) body.country = searchCompaniesParams.country;
                break;

            case 'searchPosts':
                const searchPostsParams = context.getNodeParameter('searchPostsParams', itemIndex, {}) as any;
                if (searchPostsParams.keyword) body.keyword = searchPostsParams.keyword;
                if (searchPostsParams.post_type) body.post_type = searchPostsParams.post_type;
                if (searchPostsParams.sort_by) body.sort_by = searchPostsParams.sort_by;
                if (searchPostsParams.post_date) body.post_date = searchPostsParams.post_date;
                if (searchPostsParams.linkedin_url) body.linkedin_url = searchPostsParams.linkedin_url;
                if (searchPostsParams.total_results) body.total_results = searchPostsParams.total_results;
                if (searchPostsParams.start_page) body.start_page = searchPostsParams.start_page;
                if (searchPostsParams.end_page) body.end_page = searchPostsParams.end_page;
                if (searchPostsParams.country) body.country = searchPostsParams.country;
                break;

            case 'searchCompaniesData':
                const dataCompaniesParams = context.getNodeParameter('dataCompaniesParams', itemIndex, {}) as any;
                if (dataCompaniesParams.keyword) body.keyword = dataCompaniesParams.keyword;
                if (dataCompaniesParams.industry) body.industry = dataCompaniesParams.industry;
                if (dataCompaniesParams.location) body.location = dataCompaniesParams.location;
                if (dataCompaniesParams.employee_range) body.employee_range = dataCompaniesParams.employee_range;
                if (dataCompaniesParams.founding_company !== undefined) body.founding_company = dataCompaniesParams.founding_company;
                if (dataCompaniesParams.total_results) body.total_results = dataCompaniesParams.total_results;
                break;

            case 'searchProfilesData':
                const dataProfilesParams = context.getNodeParameter('dataProfilesParams', itemIndex, {}) as any;
                if (dataProfilesParams.keyword) body.keyword = dataProfilesParams.keyword;
                if (dataProfilesParams.job_title) body.job_title = dataProfilesParams.job_title;
                if (dataProfilesParams.industry) body.industry = dataProfilesParams.industry;
                if (dataProfilesParams.school) body.school = dataProfilesParams.school;
                if (dataProfilesParams.location) body.location = dataProfilesParams.location;
                if (dataProfilesParams.current_company) body.current_company = dataProfilesParams.current_company;
                if (dataProfilesParams.total_results) body.total_results = dataProfilesParams.total_results;
                break;

            case 'getConnections':
                const getConnectionsParams = context.getNodeParameter('getConnectionsParams', itemIndex, {}) as any;
                if (getConnectionsParams.country) body.country = getConnectionsParams.country;
                if (getConnectionsParams.total_results) body.total_results = getConnectionsParams.total_results;
                if (getConnectionsParams.start_page) body.start_page = getConnectionsParams.start_page;
                if (getConnectionsParams.end_page) body.end_page = getConnectionsParams.end_page;
                break;

            case 'getReceivedInvitations':
            case 'getSentInvitations':
                const getInvitationsParams = context.getNodeParameter('getInvitationsParams', itemIndex, {}) as any;
                if (getInvitationsParams.country) body.country = getInvitationsParams.country;
                if (getInvitationsParams.invitation_type) body.invitation_type = getInvitationsParams.invitation_type;
                if (getInvitationsParams.total_results) body.total_results = getInvitationsParams.total_results;
                if (getInvitationsParams.start_page) body.start_page = getInvitationsParams.start_page;
                if (getInvitationsParams.end_page) body.end_page = getInvitationsParams.end_page;
                break;

            case 'getNetworkRecommendations':
                const getNetworkRecommendationsParams = context.getNodeParameter('getNetworkRecommendationsParams', itemIndex, {}) as any;
                if (getNetworkRecommendationsParams.country) body.country = getNetworkRecommendationsParams.country;
                if (getNetworkRecommendationsParams.total_results) body.total_results = getNetworkRecommendationsParams.total_results;
                if (getNetworkRecommendationsParams.start_page) body.start_page = getNetworkRecommendationsParams.start_page;
                if (getNetworkRecommendationsParams.end_page) body.end_page = getNetworkRecommendationsParams.end_page;
                break;

            case 'getMessageInbox':
                const getMessageInboxParams = context.getNodeParameter('getMessageInboxParams', itemIndex, {}) as any;
                if (getMessageInboxParams.country) body.country = getMessageInboxParams.country;
                if (getMessageInboxParams.total_results) body.total_results = getMessageInboxParams.total_results;
                if (getMessageInboxParams.category) body.category = getMessageInboxParams.category;
                if (getMessageInboxParams.next_cursor) body.next_cursor = getMessageInboxParams.next_cursor;
                break;

            case 'getFeed':
                const getFeedParams = context.getNodeParameter('getFeedParams', itemIndex, {}) as any;
                if (getFeedParams.country) body.country = getFeedParams.country;
                if (getFeedParams.total_results) body.total_results = getFeedParams.total_results;
                break;

            case 'getCandidates':
            case 'getJobPosts':
                const recruiterParams = context.getNodeParameter('recruiterParams', itemIndex, {}) as any;
                if (recruiterParams.country) body.country = recruiterParams.country;
                
                // Paramètres spécifiques par opération
                if (operation === 'getCandidates') {
                    if (recruiterParams.jobId) body.job_id = recruiterParams.jobId;
                    if (recruiterParams.location) body.location = recruiterParams.location;
                    if (recruiterParams.yearsOfExperience) body.yearsOfExperience = recruiterParams.yearsOfExperience;
                    if (recruiterParams.sortType) body.sortType = recruiterParams.sortType;
                    if (recruiterParams.sortOrder) body.sortOrder = recruiterParams.sortOrder;
                    if (recruiterParams.ratings) body.ratings = recruiterParams.ratings;
                    if (recruiterParams.start) body.start = recruiterParams.start;
                }
                
                if (operation === 'getJobPosts') {
                    if (recruiterParams.jobId) body.job_id = recruiterParams.jobId;
                    if (recruiterParams.fetchDetails !== undefined) body.fetch_details = recruiterParams.fetchDetails;
                }
                
                // Pagination commune
                if (recruiterParams.total_results) body.total_results = recruiterParams.total_results;
                if (recruiterParams.start_page) body.start_page = recruiterParams.start_page;
                if (recruiterParams.end_page) body.end_page = recruiterParams.end_page;
                break;

            case 'getMyProfile':
                // Pas de paramètres spécifiques, juste le login token
                break;

            case 'getCandidateCV':
                const getCandidateCVParams = context.getNodeParameter('getCandidateCVParams', itemIndex, {}) as any;
                if (getCandidateCVParams.applicationId) body.application_id = getCandidateCVParams.applicationId;
                if (getCandidateCVParams.country) body.country = getCandidateCVParams.country;
                break;

            case 'publishJob':
            case 'closeJob':
                const publishCloseJobParams = context.getNodeParameter('publishCloseJobParams', itemIndex, {}) as any;
                if (publishCloseJobParams.jobId) body.job_id = publishCloseJobParams.jobId;
                if (publishCloseJobParams.country) body.country = publishCloseJobParams.country;
                break;

            case 'createJob':
                const createJobParams = context.getNodeParameter('createJobParams', itemIndex, {}) as any;
                if (createJobParams.country) body.country = createJobParams.country;
                
                if (createJobParams.companyUrl) body.company_url = createJobParams.companyUrl;
                if (createJobParams.jobTitle) body.title = createJobParams.jobTitle;
                if (createJobParams.place) body.place = createJobParams.place;
                if (createJobParams.html_description) body.html_description = createJobParams.html_description;
                if (createJobParams.employment_status) body.employment_status = createJobParams.employment_status;
                if (createJobParams.workplace) body.workplace = createJobParams.workplace;
                if (createJobParams.skills) {
                    try {
                        body.skills = JSON.parse(createJobParams.skills);
                    } catch {
                        body.skills = createJobParams.skills;
                    }
                }
                if (createJobParams.screening_questions) {
                    try {
                        body.screening_questions = JSON.parse(createJobParams.screening_questions);
                    } catch {
                        body.screening_questions = createJobParams.screening_questions;
                    }
                }
                if (createJobParams.auto_rejection_template) body.auto_rejection_template = createJobParams.auto_rejection_template;
                if (createJobParams.contact_email) body.contact_email = createJobParams.contact_email;
                break;
        }

        // Ajouter le pays par défaut si pas spécifié
        if (!body.country) {
            body.country = 'FR';
        }

        return body;
    }

    private getEndpointForOperation(operation: string): string {
        const endpointMap: Record<string, string> = {
            // AUTH
            'login': '/auth/login',
            'verifyCode': '/auth/verify',
            
            // PROFILE
            'getMyProfile': '/profile/me',
            'extractProfileInfo': '/profile/info',
            'searchProfile': '/profile/search',
            
            // COMPANIES
            'searchCompanies': '/companies/search',
            'getCompanyInfo': '/companies/info',
            
            // NETWORK
            'sendConnectionRequest': '/network/connect',
            'getConnections': '/network/connections',
            'acceptConnectionInvitation': '/network/accept-invitations',
            'getReceivedInvitations': '/network/invitations',
            'getSentInvitations': '/network/sent-invitations',
            'withdrawInvitation': '/network/withdraw-invitation',
            'getNetworkRecommendations': '/network/recommendations',
            'getInvitationStatus': '/network/invitation-status',
            
            // MESSAGES
            'sendMessage': '/messages/send',
            'getMessageInbox': '/messages/inbox',
            'getConversationMessages': '/messages/conversation-messages',
            
            // POSTS
            'getPostReactions': '/posts/reactions',
            'reactToPost': '/posts/react',
            'repost': '/posts/repost',
            'commentPost': '/posts/comment',
            'extractComments': '/posts/extract-comments',
            'answerComment': '/posts/answer-comment',
            'searchPosts': '/posts/search',
            'createPost': '/posts/create',
            'getFeed': '/posts/feed',
            'timeSpent': '/posts/time-spent',
            
            // RECRUITER
            'getCandidates': '/recruiter/candidates',
            'getCandidateCV': '/recruiter/cv',
            'getJobPosts': '/recruiter/job-posts',
            'publishJob': '/recruiter/publish-job',
            'closeJob': '/recruiter/close-job',
            'createJob': '/recruiter/create-job',
            
            // DATA (nouveaux)
            'searchCompaniesData': '/data/search/companies',
            'searchProfilesData': '/data/search/profiles',
        };




        return endpointMap[operation] || '/unknown';
    }





    // === MAIN EXECUTION METHOD ===
    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            const resource = this.getNodeParameter('resource', i) as string;
            const operation = this.getNodeParameter('operation', i) as string;

            try {
                const timeout = 30000; // Default timeout

                // Get credentials
                const creds = await Linkup.prototype.getCredentialsWithFallback.call(this, this, i);
                
                // Construire le body de la requête
                const body = await Linkup.prototype.buildRequestBody.call(this, this, i, operation, creds.loginToken);
                
                // Get endpoint
                const endpoint = Linkup.prototype.getEndpointForOperation.call(this, operation);
                
                // Construire les options de requête
                const requestOptions = Linkup.prototype.buildRequestOptions.call(this, endpoint, 'POST', creds.apiKey, body, timeout);

                const response = await this.helpers.httpRequest(requestOptions);
                
                const result = {
                    json: {
                        _debug: {
                            requestBody: body,
                            requestHeaders: requestOptions.headers,
                            endpoint: endpoint,
                            apiResponse: response,
                        },
                        ...response,
                        _meta: {
                            resource,
                            operation,
                            timestamp: new Date().toISOString(),
                            nodeVersion: NODE_VERSION,
                        },
                    },
                    pairedItem: { item: i },
                };
                
                returnData.push(result);
            } catch (error: any) {
                returnData.push({
                    json: {
                        error: error.message || 'Unknown error',
                        resource,
                        operation,
                        timestamp: new Date().toISOString(),
                    },
                    pairedItem: { item: i },
                });
            }
        }

        return [returnData];
    }
}