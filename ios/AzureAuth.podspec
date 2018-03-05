
Pod::Spec.new do |s|
  s.name         = "AzureAuth"
  s.version      = "1.0.0"
  s.summary      = "AzureAuth"
  s.description  = <<-DESC
                  AzureAuth
                   DESC
  s.homepage     = ""
  s.license      = "MIT"
  # s.license      = { :type => "MIT", :file => "FILE_LICENSE" }
  s.author             = { "vmurin" => "vmurin@gmail.com" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/AzureAuth.git", :tag => "master" }
  s.source_files  = "AzureAuth/**/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  #s.dependency "others"

end

