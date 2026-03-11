import { getSupabaseClient } from '../supabase-client';

// 
export type ClientFileMetadata = {
	path: string; // file route in storage
	display_name?: string; // file name to show in UI
	description?: string; // decription or notes about the file
	uploaded_at: string; // timestamp of when the file was uploaded
};

export type Client = {
	id: string;
	created_at?: string;
	name?: string | null;
	last_name?: string | null;
	phone_number?: string | null;
	locality?: string | null;
	email?: string | null;
	files?: ClientFileMetadata[] | null; // array JSON
	cover?: string | null;
};

const TABLE = 'clients';

export async function getClientsCount(): Promise<{ data: number; error: any }> {
	const supabase = getSupabaseClient();
	const { count, error } = await supabase
		.from(TABLE)
		.select('*', { count: 'exact', head: true });
	return { data: count || 0, error };
}

export async function listClients(): Promise<{ data: Client[] | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select('name, last_name, id, phone_number, locality, email, files')
		.order('created_at', { ascending: false });
	return { data, error };
}

export async function getClientById(id: string): Promise<{ data: Client | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
	return { data, error };
}

export async function createClient(
	client: Omit<Client, 'id' | 'created_at'>
): Promise<{ data: Client | null; error: any }> {
	const supabase = getSupabaseClient();
	const payload = {
		...client,
		created_at: new Date().toISOString(),
	};
	const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
	return { data, error };
}

export async function updateClient(
	id: string,
	changes: Partial<Client>
): Promise<{ data: Client | null; error: any }> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase.from(TABLE).update(changes).eq('id', id).select().single();
	return { data, error };
}

export async function deleteClient(id: string): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();

	// First, delete all files in the client's folder
	try {
		const { data: files, error: listError } = await supabase.storage.from('clients').list(id);

		if (!listError && files && files.length > 0) {
			const filePaths = files.map((file) => `${id}/${file.name}`);
			await supabase.storage.from('clients').remove(filePaths);
		}
	} catch (err) {
		console.error('Error deleting client folder:', err);
	}

	// Then delete the client record
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	return { data: null, error };
}

export async function createClientFolder(clientId: string) {
	const supabase = getSupabaseClient();

	const filePath = `${clientId}/.keep.txt`;

	const blob = new Blob(['Cliente creado correctamente'], {
		type: 'text/plain',
	});

	try {
		const { data, error } = await supabase.storage.from('clients').upload(filePath, blob);

		if (error) {
			console.error('Storage upload error:', error);
		}

		return { data, error };
	} catch (err) {
		console.error('Unexpected error creating folder:', err);
		return { data: null, error: err };
	}
}

// type created for save files in buckets
export type ClientFile = ClientFileMetadata & {
	name: string; // original file name
	id: string;
	size: number;
	mimetype: string; 
};

export async function listClientFiles(
	clientId: string
): Promise<{ data: ClientFile[] | null; error: any }> {
	const supabase = getSupabaseClient();

	try {
		// Get client data to access files array
		const { data: client, error: clientError } = await getClientById(clientId);

		if (clientError || !client) {
			console.error('Error getting client:', clientError);
			return { data: [], error: clientError };
		}

		if (!client.files || client.files.length === 0) {
			return { data: [], error: null };
		}

		const { data: files } = await supabase
			.storage
			.from('clients')
			.list(clientId);		

		const clientFiles = client.files.map((fileData) => {
			const fileName = fileData.path.split('/').pop() || '';

			const fileMetadata = files?.find((f) => f.name === fileName);

			return {
				...fileData,
				name: fileName,
				id: fileMetadata?.id || fileName,
				size: fileMetadata?.metadata?.size || 0,
				mimetype: fileMetadata?.metadata?.mimetype || 'image/jpeg',
			};
		});

		return { data: clientFiles, error: null };
	} catch (err) {
		console.error('Unexpected error listing client files:', err);
		return { data: null, error: err };
	}
}

export async function uploadClientFile(
	clientId: string,
	file: File,
	displayName?: string,
	description?: string
): Promise<{ data: { path: string } | null; error: any }> {
	const supabase = getSupabaseClient();

	try {
		const fileExt = file.name.split('.').pop();
		const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
		const filePath = `${clientId}/${fileName}`;

		// Upload file to storage
		const { data, error } = await supabase.storage.from('clients').upload(filePath, file, {
			contentType: file.type,
			upsert: false,
		});

		if (error) {
			console.error('Error uploading file:', error);
			return { data: null, error };
		}

		// Get current client data
		const { data: client, error: clientError } = await getClientById(clientId);

		if (clientError || !client) {
			console.error('Error getting client:', clientError);
			return { data: null, error: clientError };
		}

		// Create file metadata object
		const fileMetadata: ClientFileMetadata = {
			path: filePath,
			uploaded_at: new Date().toISOString(),
		};

		if (displayName) {
			fileMetadata.display_name = displayName;
		}

		if (description) {
			fileMetadata.description = description;
		}

		// Add file metadata to files array
		const currentFiles = client.files || [];
		const updatedFiles = [...currentFiles, fileMetadata];

		// Update client with new images array
		const { data: updateData, error: updateError } = await updateClient(clientId, {
			files: updatedFiles,
		});

		if (updateError) {
			console.error('Error updating client files:', updateError);
            // if there's an error updating the client, we should delete the uploaded file to avoid orphan files in storage
			await supabase.storage.from('clients').remove([filePath]);
			return { data: null, error: updateError };
		}

		return {
			data: {
				path: filePath,
			},
			error: null,
		};
	} catch (err) {
		console.error('Unexpected error uploading file:', err);
		return { data: null, error: err };
	}
}

export async function deleteClientFile(
	clientId: string,
	fileName: string
): Promise<{ data: null; error: any }> {
	const supabase = getSupabaseClient();

	try {
		const filePath = `${clientId}/${fileName}`;

		// Delete from storage
		const { error } = await supabase.storage.from('clients').remove([filePath]);

		if (error) {
			console.error('Error deleting file:', error);
			return { data: null, error };
		}

		// Get current client data
		const { data: client, error: clientError } = await getClientById(clientId);

		if (clientError || !client) {
			console.error('Error getting client:', clientError);
			return { data: null, error: clientError };
		}

		// Remove file from images array by comparing paths
		const currentFiles = client.files || [];
		const updatedFiles = currentFiles.filter((file) => file.path !== filePath);

		// Update client with new images array
		const { error: updateError } = await updateClient(clientId, { files: updatedFiles });

		if (updateError) {
			console.error('Error updating client files:', updateError);
			return { data: null, error: updateError };
		}

		return { data: null, error: null };
	} catch (err) {
		console.error('Unexpected error deleting file:', err);
		return { data: null, error: err };
	}
}
