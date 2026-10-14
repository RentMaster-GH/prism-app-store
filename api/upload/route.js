import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize your clean, prefix-free Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    // Parse the incoming multipart form data from the client
    const formData = await request.formData();
    
    const title = formData.get('title');
    const description = formData.get('description');
    const developerName = formData.get('developerName');
    const file = formData.get('file'); // The application binary (.apk, .zip, etc)

    // Strict validation check
    if (!file || !title) {
      return NextResponse.json(
        { error: 'App Title and File package are required.' }, 
        { status: 400 }
      );
    }

    // Format a unique filename with a timestamp to prevent duplicate name collisions
    const safeFilename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    // STEP 1: Upload the file binary to your public 'apps' storage bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('apps')
      .upload(safeFilename, file);

    if (storageError) {
      throw new Error(`Supabase Storage failed: ${storageError.message}`);
    }

    // STEP 2: Generate the permanent, publicly shareable download link
    const { data: urlData } = supabase.storage
      .from('apps')
      .getPublicUrl(safeFilename);

    const permanentDownloadUrl = urlData.publicUrl;

    // STEP 3: Simultaneously insert the metadata and file URL into 'marketplace_apps'
    const { data: dbData, error: dbError } = await supabase
      .from('marketplace_apps')
      .insert([
        {
          title: title,
          description: description,
          developer_name: developerName,
          download_url: permanentDownloadUrl
        }
      ])
      .select();

    if (dbError) {
      // Optional cleanup: Delete the orphaned file if database log fails
      await supabase.storage.from('apps').remove([safeFilename]);
      throw new Error(`Database logging failed: ${dbError.message}`);
    }

    // Return the successful record response back to your client UI
    return NextResponse.json({ 
      success: true, 
      message: 'App listed permanently!', 
      app: dbData[0] 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
