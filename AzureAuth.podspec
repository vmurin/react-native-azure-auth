require "json"

package = JSON.parse(File.read(File.join(__dir__, "./package.json")))

Pod::Spec.new do |s|
  s.name         = "AzureAuth"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/vmurin/react-native-azure-auth"
  s.license      = "MIT"
  s.license      = { :type => "MIT", :file => "./LICENSE" }
  s.authors      = { "AzureAuth" => "vmurin@gmail.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/vmurin/react-native-azure-auth.git", :tag => "v#{s.version}" }

  s.source_files = "ios/**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React"
end