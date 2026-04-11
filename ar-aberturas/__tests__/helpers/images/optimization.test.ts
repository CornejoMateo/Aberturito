import imageCompression from 'browser-image-compression';
import { optimizeFile } from '@/helpers/images/optimization';

jest.mock('browser-image-compression', () => jest.fn());

const imageCompressionMock = jest.mocked(imageCompression);

describe('optimizeFile', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should compress images larger than 500 KB and convert them to webp', async () => {
		const originalFile = new File([new Uint8Array(600 * 1024)], 'foto.png', {
			type: 'image/png',
		});
		const compressedBlob = new Blob([new Uint8Array(100 * 1024)], { type: 'image/webp' });

		imageCompressionMock.mockResolvedValue(compressedBlob as File);

		const result = await optimizeFile(originalFile);

		expect(imageCompression).toHaveBeenCalledTimes(1);
		expect(imageCompression).toHaveBeenCalledWith(
			originalFile,
			expect.objectContaining({
				maxSizeMB: 1,
				maxWidthOrHeight: 1920,
				useWebWorker: true,
				fileType: 'image/webp',
			})
		);
		expect(result).toBeInstanceOf(File);
		expect(result.name).toBe('foto.webp');
		expect(result.type).toBe('image/webp');
		expect(result).not.toBe(originalFile);
	});

	it('should return the original file if it is not an image', async () => {
		const file = new File([new Uint8Array(700 * 1024)], 'archivo.pdf', {
			type: 'application/pdf',
		});

		const result = await optimizeFile(file);

		expect(imageCompression).not.toHaveBeenCalled();
		expect(result).toBe(file);
	});

	it('should return the original file if its an image and is 500 KB or smaller', async () => {
		const file = new File([new Uint8Array(500 * 1024)], 'chica.jpg', {
			type: 'image/jpeg',
		});

		const result = await optimizeFile(file);

		expect(imageCompression).not.toHaveBeenCalled();
		expect(result).toBe(file);
	});
});
