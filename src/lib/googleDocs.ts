export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface GoogleDocTextContent {
  documentId: string;
  title: string;
  plainText: string;
  rawDoc: any;
}

/**
 * Fetch Google Docs files from the user's Google Drive
 */
export async function listGoogleDocs(accessToken: string, searchKeyword?: string): Promise<GoogleDriveFile[]> {
  let q = "mimeType = 'application/vnd.google-apps.document' and trashed = false";
  if (searchKeyword && searchKeyword.trim().length > 0) {
    const escaped = searchKeyword.replace(/'/g, "\\'");
    q += ` and name contains '${escaped}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)&pageSize=25&orderBy=modifiedTime%20desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list Google Docs (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetch a single Google Document structure
 */
export async function getGoogleDoc(accessToken: string, documentId: string): Promise<GoogleDocTextContent> {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch Google Doc (${res.status}): ${errText}`);
  }

  const doc = await res.json();
  const plainText = extractPlainTextFromDoc(doc);

  return {
    documentId: doc.documentId,
    title: doc.title || 'Untitled Document',
    plainText,
    rawDoc: doc
  };
}

/**
 * Create a new Google Document with initial text
 */
export async function createGoogleDoc(accessToken: string, title: string, initialContent?: string): Promise<GoogleDocTextContent> {
  // 1. Create empty document
  const createUrl = 'https://docs.googleapis.com/v1/documents';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: title || 'Synthesis Note' })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Doc (${createRes.status}): ${errText}`);
  }

  const newDoc = await createRes.json();

  // 2. Insert initial content if provided
  if (initialContent && initialContent.trim().length > 0) {
    const updateUrl = `https://docs.googleapis.com/v1/documents/${newDoc.documentId}:batchUpdate`;
    await fetch(updateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: initialContent
            }
          }
        ]
      })
    });
  }

  return getGoogleDoc(accessToken, newDoc.documentId);
}

/**
 * Append text to an existing Google Document
 */
export async function appendGoogleDocContent(accessToken: string, documentId: string, textToAppend: string): Promise<void> {
  // First fetch doc to find the end index
  const doc = await getGoogleDoc(accessToken, documentId);
  const endIndex = doc.rawDoc.body?.content?.[doc.rawDoc.body.content.length - 1]?.endIndex || 1;

  const updateUrl = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;
  const res = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: Math.max(1, endIndex - 1) },
            text: `\n\n${textToAppend}`
          }
        }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append to Google Doc (${res.status}): ${errText}`);
  }
}

/**
 * Helper to parse plain text out of Google Docs JSON API representation
 */
export function extractPlainTextFromDoc(docData: any): string {
  if (!docData || !docData.body || !docData.body.content) return '';

  let fullText = '';
  for (const element of docData.body.content) {
    if (element.paragraph) {
      for (const pElem of element.paragraph.elements || []) {
        if (pElem.textRun && pElem.textRun.content) {
          fullText += pElem.textRun.content;
        }
      }
    } else if (element.table) {
      for (const row of element.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          fullText += extractPlainTextFromDoc({ body: { content: cell.content } }) + ' ';
        }
        fullText += '\n';
      }
    }
  }

  return fullText;
}
