import 'react-easy-crop/react-easy-crop.css'
import { useState, useCallback, useRef, useMemo } from 'react'
import toast from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import ImageCompressor from 'js-image-compressor'
import { DarkThemeToggle, Button } from 'flowbite-react'

import Layout from './ui/Layout'
import UploadInput from './ui/UploadInput'
import Toggle from './ui/Toggle'
import Select from './ui/Select'
import DownloadIcon from './Icons/DownloadIcon'
import getCroppedImage from './utils/getCroppedImage'
import formatBytes from './utils/formatBytes'
import {
  IMAGE_MAX_SIZE_IN_MB,
  ASPECT_OPTIONS,
  QUALITY_OPTIONS,
  SIZE_OPTIONS,
} from './constants'

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
  const [cropAspect, setCropAspect] = useState(ASPECT_OPTIONS[0].id)
  const [compressQuality, setCompressQuality] = useState(QUALITY_OPTIONS[0].id)
  const [compressMaxWidth, setCompressMaxWidth] = useState(SIZE_OPTIONS[6].id)
  const [compressMaxHeight, setCompressMaxHeight] = useState(SIZE_OPTIONS[0].id)

  const selectedAspectValue = useMemo(() => {
    return (
      ASPECT_OPTIONS.find((option) => option.id === cropAspect)?.value ??
      ASPECT_OPTIONS[0].value
    )
  }, [cropAspect])

  const selectedQualityValue = useMemo(() => {
    return (
      QUALITY_OPTIONS.find((option) => option.id === compressQuality)?.value ??
      QUALITY_OPTIONS[0].value
    )
  }, [compressQuality])

  const selectedMaxWidthValue = useMemo(() => {
    return SIZE_OPTIONS.find((option) => option.id === compressMaxWidth)?.value
  }, [compressMaxWidth])

  const selectedMaxHeightValue = useMemo(() => {
    return SIZE_OPTIONS.find((option) => option.id === compressMaxHeight)?.value
  }, [compressMaxHeight])

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    croppedAreaPixelsRef.current = croppedAreaPixels
  }, [])

  const compressImage = useCallback(
    (file) => {
      const compressionOptions = {
        file,
        maxWidth: selectedMaxWidthValue ?? undefined,
        maxHeight: selectedMaxHeightValue ?? undefined,
        quality: selectedQualityValue,
        success: (compressedFile) => {
          setCompressedImageSize(compressedFile.size)
          setCompressedImageUrl(URL.createObjectURL(compressedFile))
        },
        error: (msg) => {
          console.error(`💥💥💥`, msg)
          toast.error(`An unexpected error has occurred.`, {
            duration: 5000,
            icon: '⛔',
          })
        },
      }
      new ImageCompressor(compressionOptions)
    },
    [selectedMaxHeightValue, selectedMaxWidthValue, selectedQualityValue]
  )

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
    <Layout>
      <div className='relative pt-2 pb-12 mx-auto max-w-3xl'>
        <div className='flex justify-between items-center cu-px-standard'>
          <div>
            {Boolean(croppedImageSize || compressedImageSize) && imageLoaded ? (
              <Button onClick={resetValues} size='xs' className='min-w-28'>
                <span className='text-lg leading-5'>{`Reset`}</span>
              </Button>
            ) : (
              <div className='text-lg font-semibold xs:text-xl'>{`Crop & Compress Images`}</div>
            )}
          </div>

          <DarkThemeToggle />
        </div>

        <div className='pt-5'>
          {!imageLoaded && (
            <div>
              <UploadInput
                onClick={resetValues}
                onChange={handleInputOnChange}
                disabled={!shouldCrop && !shouldCompress}
              />

              <div className='cu-px-standard sm:grid sm:grid-cols-2'>
                <div>
                  <div className='w-full max-w-72 pb-5 mx-auto'>
                    <Toggle
                      checked={shouldCrop}
                      onChange={(e) => {
                        const newChecked = e.target.checked
                        setShouldCrop(newChecked)
                        if (!newChecked) {
                          setShouldCompress(true)
                        }
                      }}
                    >
                      {`Crop Image`}
                    </Toggle>
                  </div>

                  <div className='w-full max-w-72 pb-5 mx-auto'>
                    <Toggle
                      checked={shouldCompress}
                      onChange={(e) => {
                        const newChecked = e.target.checked
                        setShouldCompress(newChecked)
                        if (!newChecked) {
                          setShouldCrop(true)
                        }
                      }}
                    >
                      {`Compress Image`}
                    </Toggle>
                  </div>
                </div>

                <div className={shouldCompress ? '' : 'opacity-40'}>
                  <div className='w-full max-w-72 pb-5 mx-auto'>
                    <Select
                      id='compression_quality_selector'
                      label={`Compression Quality`}
                      value={compressQuality}
                      onChange={(e) => setCompressQuality(e.target.value)}
                      disabled={!shouldCompress}
                    >
                      {QUALITY_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.id}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className='w-full max-w-72 pb-5 mx-auto'>
                    <Select
                      id='compression_max_width_selector'
                      label={`Compression Max Width`}
                      value={compressMaxWidth}
                      onChange={(e) => setCompressMaxWidth(e.target.value)}
                      disabled={!shouldCompress}
                    >
                      {SIZE_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.id}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className='w-full max-w-72 pb-5 mx-auto'>
                    <Select
                      id='compression_max_height_selector'
                      label={`Compression Max Height`}
                      value={compressMaxHeight}
                      onChange={(e) => setCompressMaxHeight(e.target.value)}
                      disabled={!shouldCompress}
                    >
                      {SIZE_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.id}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {Boolean(croppedImageSize || compressedImageSize) && imageLoaded && (
            <div>
              <div className='cu-px-standard text-lg max-w-lg mx-auto'>
                <div className='flex justify-between items-center'>
                  {`Original size: `}
                  <span className='font-semibold'>
                    {formatBytes(orginalImageSize)}
                  </span>
                </div>

                {Boolean(croppedImageSize) && (
                  <div className='flex justify-between items-center'>
                    {`Cropped size: `}
                    <span className='font-semibold'>
                      {formatBytes(croppedImageSize)}
                    </span>
                  </div>
                )}

                {Boolean(compressedImageSize) && (
                  <div className='flex justify-between items-center'>
                    {`Compressed size: `}
                    <span className='font-semibold'>
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
              <div className='pb-10'>
                <div className='relative h-[calc(100lvh-4rem)] max-h-[800px]'>
                  <div className='h-20 absolute top-0 left-0 right-0 px-5 flex flex-col justify-between'>
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

                    <div className='pb-1 flex justify-between items-center'>
                      <div className='w-24'>
                        <Select
                          value={cropAspect}
                          onChange={(e) => setCropAspect(e.target.value)}
                        >
                          {ASPECT_OPTIONS.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.id}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <Button
                        onClick={cropImage}
                        size='xs'
                        className='min-w-28'
                      >
                        <span className='text-lg leading-5'>{`Done`}</span>
                      </Button>
                    </div>
                  </div>

                  <div className='absolute left-0 right-0 top-20 bottom-0'>
                    <Cropper
                      aspect={selectedAspectValue}
                      image={tempImageUrlToCrop}
                      crop={crop}
                      zoom={zoom}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      disableAutomaticStylesInjection
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
