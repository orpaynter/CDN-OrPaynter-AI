import { getNetlifyContext } from 'utils';
import { Alert } from './alert';
import { Markdown } from './markdown';

const noNetlifyContextAlert = `
For full functionality, run this site locally via \`npm run dev\` or \`netlify dev\`
([see docs](https://github.com/orpaynter/CDN-OrPaynter-AI#developing-locally)) for edge functions and blob store features.
`;

export function ContextAlert(props) {
    const { addedChecksFunction, className } = props;
    const ctx = getNetlifyContext();

    let markdownText = null;
    if (!ctx) {
        markdownText = noNetlifyContextAlert;
    } else if (addedChecksFunction) {
        markdownText = addedChecksFunction(ctx);
    }

    if (markdownText) {
        return (
            <Alert className={className}>
                <Markdown content={markdownText} />
            </Alert>
        );
    } else {
        return <></>;
    }
}
