import 'react-easy-crop/react-easy-crop.css'
import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import ImageCompressor from 'js-image-compressor'
import { Button } from 'flowbite-react'

import Layout from './ui/Layout'
import UploadInput from './ui/UploadInput'
import DownloadIcon from './Icons/DownloadIcon'
import getCroppedImage from './utils/getCroppedImage'
import formatBytes from './utils/formatBytes'
import { IMAGE_MAX_SIZE_IN_MB } from './constants'

export default function App() {
  const croppedAreaPixelsRef = useRef(null)

  const [fileName, setFileName] = useState('')
  const [zoom, setZoom] = useState(1)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [tempImageUrlToCrop, setTempImageUrlToCrop] = useState('')
  const [orginalImageSize, setOrginalImageSize] = useState(0)
  const [croppedImageSize, setCroppedImageSize] = useState(0)
  const [compressedImageSize, setCompressedImageSize] = useState(0)
  const [croppedImageUrl, setCroppedImageUrl] = useState('')
  const [compressedImageUrl, setCompressedImageUrl] = useState('')
  const [shouldCrop, setShouldCrop] = useState(true)
  const [shouldCompress, setShouldCompress] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    croppedAreaPixelsRef.current = croppedAreaPixels
  }, [])

  const compressImage = useCallback((file) => {
    const compressionOptions = {
      file,
      maxWidth: 400,
      quality: 0.9,
      success: (compressedFile) => {
        setCompressedImageSize(compressedFile.size)
        setCompressedImageUrl(URL.createObjectURL(compressedFile))
      },
      error: (msg) => {
        console.error(`💥💥💥`, msg)
      },
    }
    new ImageCompressor(compressionOptions)
  }, [])

  const cropImage = useCallback(async () => {
    try {
      const newCroppedImageBlob = await getCroppedImage(
        tempImageUrlToCrop,
        croppedAreaPixelsRef.current
      )

      setTempImageUrlToCrop('')
      setCroppedImageSize(newCroppedImageBlob.size)
      setCroppedImageUrl(URL.createObjectURL(newCroppedImageBlob))

      if (shouldCompress) {
        compressImage(newCroppedImageBlob)
      }
    } catch (error) {
      console.error(error)
      console.error(`💥💥💥 '${error?.message}'`)

      toast.error(`An unexpected error has occurred.`, {
        duration: 5000,
        icon: '⛔',
      })
    }
  }, [compressImage, shouldCompress, tempImageUrlToCrop])

  const resetValues = useCallback(() => {
    croppedAreaPixelsRef.current = null
    setTempImageUrlToCrop('')
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    setFileName('')
    setOrginalImageSize(0)
    setCroppedImageSize(0)
    setCompressedImageSize(0)
    setCroppedImageUrl('')
    setCompressedImageUrl('')
    setImageLoaded(false)
  }, [])

  const handleInputOnChange = useCallback(
    (e) => {
      const file = e.target.files[0]

      if (file) {
        const fileMaxSizeInBytes = 1024 * 1024 * IMAGE_MAX_SIZE_IN_MB

        if (file.size > fileMaxSizeInBytes) {
          toast.error(
            `The file exceeds the ${IMAGE_MAX_SIZE_IN_MB} MB limit.`,
            {
              duration: 5000,
              icon: '⛔',
            }
          )
        } else {
          setFileName(file.name)
          setOrginalImageSize(file.size)
          setImageLoaded(true)

          if (shouldCrop) {
            setTempImageUrlToCrop(URL.createObjectURL(file))
          } else {
            compressImage(file)
          }
        }
      }
    },
    [compressImage, shouldCrop]
  )

  return (
    <Layout
      topLeftContent={
        Boolean(croppedImageSize || compressedImageSize) && imageLoaded ? (
          <Button onClick={resetValues} size='xs' className='min-w-28'>
            <span className='text-lg leading-5'>{`Reset`}</span>
          </Button>
        ) : null
      }
    >
      <div className='relative pt-3 pb-10 min-h-[460px] xs:min-h-[530px] md:min-h-[660px]'>
        {!imageLoaded && (
          <div>
            <UploadInput
              onClick={resetValues}
              onChange={handleInputOnChange}
              disabled={!shouldCrop && !shouldCompress}
            />

            <div className='cu-px-standard'>
              <div className='pb-5'>
                <label className='inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    checked={shouldCrop}
                    onChange={(e) => {
                      const newChecked = e.target.checked
                      setShouldCrop(newChecked)
                      if (!newChecked) {
                        setShouldCompress(true)
                      }
                    }}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
                  <span className='ms-3 font-medium text-gray-900 dark:text-gray-300 text-lg leading-5'>
                    {`Crop Image`}
                  </span>
                </label>
              </div>

              <div className='pb-5'>
                <label className='inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    checked={shouldCompress}
                    onChange={(e) => {
                      const newChecked = e.target.checked
                      setShouldCompress(newChecked)
                      if (!newChecked) {
                        setShouldCrop(true)
                      }
                    }}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
                  <span className='ms-3 font-medium text-gray-900 dark:text-gray-300 text-lg leading-5'>
                    {`Compress Image`}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {Boolean(croppedImageSize || compressedImageSize) && imageLoaded && (
          <div>
            <div className='cu-px-standard text-lg max-w-lg mx-auto'>
              <div className='flex justify-between items-center'>
                {`Original size: `}
                <span className='font-bold'>
                  {formatBytes(orginalImageSize)}
                </span>
              </div>

              {Boolean(croppedImageSize) && (
                <div className='flex justify-between items-center'>
                  {`Cropped size: `}
                  <span className='font-bold'>
                    {formatBytes(croppedImageSize)}
                  </span>
                </div>
              )}

              {Boolean(compressedImageSize) && (
                <div className='flex justify-between items-center'>
                  {`Compressed size: `}
                  <span className='font-bold'>
                    {formatBytes(compressedImageSize)}
                  </span>
                </div>
              )}

              {croppedImageUrl && (
                <div className='pt-5 flex justify-center'>
                  <Button
                    as={'a'}
                    href={croppedImageUrl}
                    download={`cropped_${fileName}`}
                    className='min-w-64'
                  >
                    <DownloadIcon className='mr-1' width='20' height='20' />
                    <span className='text-lg leading-5'>{`Download Cropped`}</span>
                  </Button>
                </div>
              )}

              {compressedImageUrl && (
                <div className='pt-5 flex justify-center'>
                  <Button
                    as={'a'}
                    href={compressedImageUrl}
                    download={
                      shouldCrop
                        ? `cropped_compressed_${fileName}`
                        : `compressed_${fileName}`
                    }
                    className='min-w-64'
                  >
                    <DownloadIcon className='mr-1' width='20' height='20' />
                    <span className='text-lg leading-5'>{`Download Compressed`}</span>
                  </Button>
                </div>
              )}
            </div>

            {((shouldCompress && compressedImageUrl) ||
              (!shouldCompress && croppedImageUrl)) && (
              <div className='pt-5'>
                <img
                  alt='Result'
                  src={shouldCompress ? compressedImageUrl : croppedImageUrl}
                  className='mx-auto'
                />
              </div>
            )}
          </div>
        )}

        {tempImageUrlToCrop && (
          <div className='absolute top-0 bottom-0 left-0 right-0 cu-bg-standard'>
            <div className='absolute left-0 right-0 top-0 bottom-20'>
              <Cropper
                aspect={1}
                image={tempImageUrlToCrop}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                disableAutomaticStylesInjection
              />
            </div>

            <div className='h-20 absolute bottom-0 left-0 right-0 px-5 flex flex-col justify-between'>
              <div className='pt-1'>
                <input
                  type='range'
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                  aria-labelledby='Zoom'
                  className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
                />
              </div>

              <div className='flex justify-center'>
                <Button onClick={cropImage} size='xs' className='min-w-28'>
                  <span className='text-lg leading-5'>{`Done`}</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
