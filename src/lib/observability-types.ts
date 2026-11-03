export type StorageKind =
	| 'blog-covers'
	| 'blog-inline'
	| 'blog-portraits'
	| 'about-portraits-professional'
	| 'about-portraits-personal'
	| 'music'
	| 'resume'
	| 'background';

export type StorageReference = {
	kind: string;
	label: string;
	detail?: string;
};

export type StorageItem = {
	id: string;
	kind: StorageKind;
	bucket: string | null;
	path: string;
	name: string;
	url: string;
	bytes: number | null;
	createdAt: string | null;
	musicImageId: string | null;
	deletable: boolean;
	references: StorageReference[];
	readonlyReason: string | null;
};

export type UploadTarget =
	| 'blog-covers'
	| 'blog-inline'
	| 'about-portraits-professional'
	| 'about-portraits-personal'
	| 'music'
	| 'resume';

export const UPLOAD_TARGETS: { id: UploadTarget; label: string; accept: string; hint: string }[] = [
	{
		id: 'blog-covers',
		label: 'Blog / project cover',
		accept: 'image/jpeg,image/png,image/webp,image/gif',
		hint: 'Uploads to blog-images/covers'
	},
	{
		id: 'blog-inline',
		label: 'Inline body image',
		accept: 'image/jpeg,image/png,image/webp,image/gif',
		hint: 'Uploads to blog-images/inline'
	},
	{
		id: 'about-portraits-professional',
		label: 'Professional portrait',
		accept: 'image/jpeg,image/png,image/webp,image/gif',
		hint: 'Uploads to portraits/professional'
	},
	{
		id: 'about-portraits-personal',
		label: 'Personal portrait',
		accept: 'image/jpeg,image/png,image/webp,image/gif',
		hint: 'Uploads to portraits/personal'
	},
	{
		id: 'music',
		label: 'Music / album art',
		accept: 'image/jpeg,image/png,image/webp',
		hint: 'Uploads to albums bucket + music library'
	},
	{
		id: 'resume',
		label: 'Resume PDF',
		accept: 'application/pdf',
		hint: 'Uploads to resumes/current.pdf (replaces current)'
	}
];
