'use client';

import { useState } from 'react';

export default function UploadProfileImage({ onUpload }: { onUpload: (url: string) => void }) {
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);

	const handleUpload = async () => {
		if (!file) return;
		setLoading(true);

    // cloudinary upload password protection
		const timestamp = Math.floor(Date.now() / 1000);
		const paramsToSign = { timestamp };
		const res = await fetch('/api/upload', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ paramsToSign }),
		});
		const { signature } = await res.json();

		const formData = new FormData();
		formData.append('file', file);
		formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
		formData.append('timestamp', timestamp.toString());
		formData.append('signature', signature);
		formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!);

		const uploadRes = await fetch(
			`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
			{
				method: 'POST',
				body: formData,
			}
		);

		const data = await uploadRes.json();
		setLoading(false);

		const imageUrl = data.secure_url;
		onUpload(imageUrl);
	};

	return (
		<div className="space-y-3">
			<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
			<button
				onClick={handleUpload}
				disabled={!file || loading}
				className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
			>
				{loading ? 'Subiendo...' : 'Subir imagen'}
			</button>
		</div>
	);
}
