// components/ImageUpload.js 
// 이미지 업로드 컴포넌트 - UploadThing과 연동됩니다

"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useUploadThing } from "@/lib/uploadthing-client"
import Image from "next/image"
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  RefreshCw,
  Loader2
} from "lucide-react"

export default function ImageUpload({ onUploadComplete, disabled }) {
  const [preview, setPreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState(null)

  // 🔗 UploadThing 훅 설정
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("✅ 업로드 완료:", res)
      setIsUploading(false)
      setUploadProgress(100)
      setUploadSuccess(true)
      
      if (res?.[0]) {
        onUploadComplete(res[0].url)
        console.log("📁 이미지 URL:", res[0].url)
        
        // 2초 후 성공 상태 초기화
        setTimeout(() => setUploadSuccess(false), 2000)
      }
    },
    onUploadError: (error) => {
      console.error("❌ 업로드 오류:", error)
      setIsUploading(false)
      setUploadProgress(0)
      
      // 에러 메시지 설정
      if (error.message.includes("FileSizeMismatch")) {
        setError("파일 크기가 4MB를 초과합니다.")
      } else if (error.message.includes("InvalidFileType")) {
        setError("이미지 파일만 업로드 가능합니다. (PNG, JPG, WEBP)")
      } else {
        setError("이미지 업로드에 실패했습니다. 다시 시도해주세요.")
      }
      
      // 5초 후 에러 메시지 자동 제거
      setTimeout(() => setError(null), 5000)
    },
    onUploadBegin: (name) => {
      console.log("🚀 업로드 시작:", name)
      setIsUploading(true)
      setError(null)
      setUploadProgress(0)
    },
    onUploadProgress: (progress) => {
      console.log("📊 업로드 진행률:", progress + "%")
      setUploadProgress(progress)
    }
  })

  // 📁 파일 드롭 처리
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    console.log("📁 파일 드롭됨:", { acceptedFiles, rejectedFiles })
    
    // 🚨 거부된 파일 처리
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      
      if (rejection.errors.some(error => error.code === 'file-too-large')) {
        setError("파일 크기는 4MB 이하여야 합니다.")
      } else if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
        setError("PNG, JPG, WEBP 형식만 지원됩니다.")
      } else {
        setError("파일을 업로드할 수 없습니다.")
      }
      
      setTimeout(() => setError(null), 5000)
      return
    }

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    console.log("📷 선택된 파일:", file.name, file.size, "bytes")

    // 🖼️ 미리보기 생성
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    console.log("👀 미리보기 생성됨")

    // 🚀 업로드 시작
    try {
      await startUpload([file])
    } catch (error) {
      console.error("업로드 시작 오류:", error)
      setError("업로드를 시작할 수 없습니다.")
    }
  }, [startUpload])

  // 🗑️ 이미지 제거
  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview) // 메모리 해제
    }
    setPreview(null)
    setUploadProgress(0)
    setUploadSuccess(false)
    setError(null)
    onUploadComplete("")
    console.log("🗑️ 이미지 제거됨")
  }

  // 🔄 업로드 재시도
  const retryUpload = () => {
    setError(null)
    setUploadProgress(0)
    // 파일 선택 다이얼로그 다시 열기
    document.querySelector('input[type="file"]')?.click()
  }

  // 🎛️ 드래그 앤 드롭 설정
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024, // 4MB
    disabled: disabled || isUploading
  })

  return (
    <div className="w-full">
      {/* 📤 업로드 영역 */}
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 scale-105' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            {/* 아이콘 */}
            <div className={`
              inline-flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300
              ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}
              ${error ? 'bg-red-100' : ''}
            `}>
              {error ? (
                <AlertCircle className="w-8 h-8 text-red-500" />
              ) : isUploading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <Upload className={`
                  w-8 h-8 transition-all duration-300
                  ${isDragActive ? 'text-blue-600 animate-bounce' : 'text-gray-500'}
                `} />
              )}
            </div>

            {/* 텍스트 */}
            <div>
              {error ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-red-700">
                    업로드 실패
                  </p>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    type="button"
                    onClick={retryUpload}
                    className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>다시 시도</span>
                  </button>
                </div>
              ) : isUploading ? (
                <div>
                  <p className="text-lg font-medium text-blue-700">
                    업로드 중... {uploadProgress}%
                  </p>
                  <p className="text-sm text-blue-600">
                    잠시만 기다려주세요
                  </p>
                </div>
              ) : isDragActive ? (
                <div>
                  <p className="text-lg font-medium text-blue-700">
                    이미지를 여기에 놓으세요
                  </p>
                  <p className="text-sm text-blue-600">
                    파일을 놓으면 업로드가 시작됩니다
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    이미지를 업로드하세요
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    클릭하거나 드래그해서 파일을 선택하세요
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, WEBP (최대 4MB)
                  </p>
                </div>
              )}
            </div>

            {/* 업로드 버튼 */}
            {!error && !isDragActive && !isUploading && (
              <button
                type="button"
                className="btn-primary px-6 py-3 mx-auto"
                disabled={disabled || isUploading}
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                파일 선택하기
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 🖼️ 이미지 미리보기 */
        <div className="space-y-4 animate-scaleIn">
          <div className="relative bg-gray-100 rounded-xl overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={preview}
                alt="업로드할 이미지 미리보기"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* 성공 오버레이 */}
              {uploadSuccess && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-fadeIn">
                  <div className="bg-white rounded-full p-3 shadow-lg animate-bounceIn">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              )}
              
              {/* 로딩 오버레이 */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
                    <p className="font-medium text-lg">업로드 중...</p>
                    <p className="text-sm opacity-75">{uploadProgress}%</p>
                    
                    {/* 진행률 바 */}
                    <div className="w-32 bg-white/20 rounded-full h-2 mt-3 mx-auto">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 제거 버튼 */}
            {!isUploading && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                title="이미지 제거"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 상태 메시지 */}
          <div className="text-center">
            {isUploading ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  이미지를 업로드하고 있습니다... ({uploadProgress}%)
                </p>
                <p className="text-xs text-gray-500">
                  업로드가 완료될 때까지 페이지를 닫지 마세요
                </p>
              </div>
            ) : uploadSuccess ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">업로드 완료!</span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                다른 이미지를 선택하려면 X 버튼을 클릭하세요
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}